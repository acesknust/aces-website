"""
Shop views — Production-hardened (Feb 2026 Audit)
Payment deduplication patch (Feb 18, 2026)
"""
import hmac
import hashlib
import logging
import threading
import uuid
from datetime import timedelta

import requests
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Product, Category, Order, OrderItem, Coupon
from .serializers import ProductSerializer, CategorySerializer, OrderSerializer
from .utils import send_customer_email, send_admin_email
from payment_logs.models import WebhookLog

logger = logging.getLogger(__name__)


# =============================================================================
# Product Views (FIX: N+1 queries via select_related / prefetch_related)
# =============================================================================

class ProductListView(generics.ListAPIView):
    """List all active products with related data pre-fetched."""
    queryset = Product.objects.filter(is_active=True).select_related(
        'category'
    ).prefetch_related('images', 'sizes')
    serializer_class = ProductSerializer


class ProductDetailView(generics.RetrieveAPIView):
    """Retrieve a single product by slug with related data pre-fetched."""
    queryset = Product.objects.filter(is_active=True).select_related(
        'category'
    ).prefetch_related('images', 'sizes')
    serializer_class = ProductSerializer
    lookup_field = 'slug'


# =============================================================================
# Order Creation (FIX: atomic transactions, bulk_create, no mock fallback)
# =============================================================================

class CreateOrderView(APIView):
    def post(self, request):
        try:
            data = request.data
            cart_items = data.get('items', [])
            user_details = data.get('user_details', data)

            if not cart_items:
                return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

            # 1. Calculate Total Price on Backend (Batch Fetch)
            total_amount = Decimal('0')
            order_items_data = []

            item_map = {item.get('id'): item for item in cart_items}
            product_ids = list(item_map.keys())

            products = Product.objects.filter(id__in=product_ids, is_active=True)

            if len(products) != len(product_ids):
                found_ids = set(p.id for p in products)
                missing_ids = set(product_ids) - found_ids
                return Response(
                    {"error": f"Products with IDs {missing_ids} not found or inactive"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            for product in products:
                cart_item = item_map[product.id]
                quantity = cart_item.get('quantity', 1)
                color = cart_item.get('color')
                size = cart_item.get('size')
                price = product.price
                total_amount += price * quantity
                order_items_data.append((product, quantity, price, color, size))

            # 2. Handle Coupon Code (if provided)
            coupon = None
            discount_amount = Decimal('0')
            coupon_code = data.get('coupon_code', '').strip().upper()

            if coupon_code:
                try:
                    coupon = Coupon.objects.get(code=coupon_code)
                    if coupon.is_valid():
                        discount_percent = Decimal(str(coupon.discount_percent))
                        discount_amount = round(total_amount * (discount_percent / 100), 2)
                        total_amount = round(total_amount - discount_amount, 2)
                    else:
                        coupon = None
                except Coupon.DoesNotExist:
                    pass

            # 3. Create or Reuse Order + Items ATOMICALLY
            # FIX (Feb 2026): Reuse existing PENDING order for same email
            # to prevent duplicate orders when users click checkout multiple times.
            #
            # IMPORTANT: The select_for_update() lock and the order update MUST be
            # in the SAME transaction.atomic() block. Otherwise, the row lock is
            # released between the lookup and update, allowing a race condition.
            email = user_details.get('email')

            with transaction.atomic():
                existing_order = Order.objects.select_for_update().filter(
                    email=email,
                    status='PENDING',
                    created_at__gte=timezone.now() - timedelta(hours=1)
                ).order_by('-created_at').first()

                if existing_order and existing_order.paystack_reference:
                    # Reuse the existing PENDING order, but update it with
                    # current cart data in case the user changed items between clicks.
                    order = existing_order

                    # Handle coupon changes between retries:
                    # If user switched coupons, fix the usage counts.
                    old_coupon = order.coupon
                    if old_coupon != coupon:
                        # Decrement old coupon's count (it was incremented on first create)
                        # Guard: PositiveIntegerField cannot go below 0
                        if old_coupon:
                            Coupon.objects.filter(
                                id=old_coupon.id, times_used__gt=0
                            ).update(times_used=F('times_used') - 1)
                        # Increment new coupon's count
                        if coupon:
                            Coupon.objects.filter(id=coupon.id).update(
                                times_used=F('times_used') + 1
                            )

                    order.full_name = user_details.get('full_name')
                    order.phone = user_details.get('phone')
                    order.address = user_details.get('address')
                    order.total_amount = total_amount
                    order.coupon = coupon
                    order.discount_amount = discount_amount
                    order.save()

                    # Replace old items with current cart
                    order.items.all().delete()
                    OrderItem.objects.bulk_create([
                        OrderItem(
                            order=order,
                            product=product,
                            quantity=quantity,
                            price=price,
                            selected_color=color,
                            selected_size=size
                        )
                        for product, quantity, price, color, size in order_items_data
                    ])

                    logger.info(
                        f"REUSING existing PENDING order #{order.id} for {email} "
                        f"(updated with current cart data)"
                    )
                else:
                    # Create a fresh order
                    order = Order.objects.create(
                        user=request.user if request.user.is_authenticated else None,
                        full_name=user_details.get('full_name'),
                        email=email,
                        phone=user_details.get('phone'),
                        address=user_details.get('address'),
                        total_amount=total_amount,
                        coupon=coupon,
                        discount_amount=discount_amount,
                        status='PENDING'
                    )

                    if coupon:
                        Coupon.objects.filter(id=coupon.id).update(times_used=F('times_used') + 1)

                    OrderItem.objects.bulk_create([
                        OrderItem(
                            order=order,
                            product=product,
                            quantity=quantity,
                            price=price,
                            selected_color=color,
                            selected_size=size
                        )
                        for product, quantity, price, color, size in order_items_data
                    ])

            # 4. Initialize Paystack Transaction
            paystack_url = "https://api.paystack.co/transaction/initialize"
            headers = {
                "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
                "Content-Type": "application/json"
            }

            amount_kobo = int(total_amount * 100)

            try:
                base_url = settings.CORS_ALLOWED_ORIGINS[0]
            except (IndexError, AttributeError):
                base_url = "http://localhost:3000"

            callback_url = f"{base_url}/shop/success"

            payload = {
                "email": order.email,
                "amount": amount_kobo,
                "currency": "GHS",
                "callback_url": callback_url,
                "metadata": {
                    "order_id": order.id,
                    "custom_fields": [
                        {
                            "display_name": "Order ID",
                            "variable_name": "order_id",
                            "value": order.id
                        }
                    ]
                }
            }

            # ---------------------------------------------------------------
            # MOCK MODE: Only allowed in DEBUG (development) mode
            # FIX: In production, Paystack errors return 503, NOT a fake payment
            # ---------------------------------------------------------------
            is_mock_mode = (
                settings.DEBUG and
                settings.PAYSTACK_SECRET_KEY and
                settings.PAYSTACK_SECRET_KEY.startswith('sk_test_xx')
            )

            if is_mock_mode:
                mock_reference = f"mock-{order.id}-{uuid.uuid4()}"
                order.paystack_reference = mock_reference
                order.save()

                mock_auth_url = f"{callback_url}?reference={mock_reference}"

                return Response({
                    "authorization_url": mock_auth_url,
                    "access_code": "mock_access_code",
                    "reference": mock_reference,
                    "order_id": order.id,
                    "message": "MOCK PAYMENT (Development Only)"
                }, status=status.HTTP_200_OK)

            # ---------------------------------------------------------------
            # REAL PAYSTACK CALL
            # ---------------------------------------------------------------
            try:
                response = requests.post(paystack_url, json=payload, headers=headers, timeout=15)
                res_data = response.json()

                if res_data.get('status'):
                    authorization_url = res_data['data']['authorization_url']
                    access_code = res_data['data']['access_code']
                    reference = res_data['data']['reference']

                    order.paystack_reference = reference
                    order.save()

                    return Response({
                        "authorization_url": authorization_url,
                        "access_code": access_code,
                        "reference": reference,
                        "order_id": order.id
                    }, status=status.HTTP_200_OK)
                else:
                    logger.error(f"PAYSTACK INIT ERROR: {res_data}")
                    return Response(
                        {"error": "Payment initialization failed", "details": res_data.get('message', 'Unknown error')},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            except requests.exceptions.RequestException as e:
                # FIX: In production, do NOT fall back to mock mode.
                # Return a proper error so the frontend can show a retry message.
                logger.error(f"PAYSTACK CONNECTION ERROR: {e}")
                return Response(
                    {"error": "Payment service temporarily unavailable. Please try again in a moment."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

        except Exception as e:
            logger.error(f"ORDER CREATION ERROR: {e}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# =============================================================================
# Payment Verification (FIX: verify amount with Paystack before marking PAID)
# =============================================================================

class VerifyPaymentView(APIView):
    def get(self, request):
        reference = request.query_params.get('reference')
        if not reference:
            return Response({"error": "No reference provided"}, status=status.HTTP_400_BAD_REQUEST)

        # MOCK VERIFICATION (only works if DEBUG is True)
        if reference.startswith('mock-') and settings.DEBUG:
            try:
                order = Order.objects.get(paystack_reference=reference)
                return self._complete_verification(order)
            except Order.DoesNotExist:
                return Response({"error": "Order not found for mock reference"}, status=status.HTTP_404_NOT_FOUND)

        # REAL PAYSTACK VERIFICATION
        paystack_url = f"https://api.paystack.co/transaction/verify/{reference}"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        }

        try:
            response = requests.get(paystack_url, headers=headers, timeout=15)
            res_data = response.json()

            if res_data.get('status') and res_data['data']['status'] == 'success':
                try:
                    order = Order.objects.get(paystack_reference=reference)
                except Order.DoesNotExist:
                    return Response({"error": "Order not found for reference"}, status=status.HTTP_404_NOT_FOUND)

                # FIX: Verify the amount Paystack received matches our order total
                paystack_amount_kobo = res_data['data'].get('amount', 0)
                expected_amount_kobo = int(order.total_amount * 100)

                if paystack_amount_kobo != expected_amount_kobo:
                    logger.critical(
                        f"AMOUNT MISMATCH: Order #{order.id} expected {expected_amount_kobo} kobo, "
                        f"Paystack received {paystack_amount_kobo} kobo. Reference: {reference}"
                    )
                    return Response(
                        {"error": "Payment amount mismatch. Please contact support."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                return self._complete_verification(order)
            else:
                return Response({"error": "Payment verification failed"}, status=status.HTTP_400_BAD_REQUEST)

        except requests.exceptions.RequestException as e:
            logger.error(f"PAYSTACK VERIFY ERROR: {e}")
            return Response(
                {"error": "Could not verify payment. Please try again."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

    def _complete_verification(self, order_obj):
        """
        Shared logic for completing payment verification.
        Can be called from frontend callback OR webhook handler.
        """
        try:
            with transaction.atomic():
                current_order = Order.objects.select_for_update().get(id=order_obj.id)

                if current_order.status == 'PAID':
                    serializer = OrderSerializer(current_order)
                    return Response({
                        "message": "Order already paid",
                        "order": serializer.data
                    }, status=status.HTTP_200_OK)

                # Decrement Stock
                order_items = current_order.items.select_related('product').all()

                for item in order_items:
                    product = Product.objects.select_for_update().get(id=item.product.id)
                    product.stock -= item.quantity
                    product.save()

                current_order.status = 'PAID'
                current_order.verification_code = str(uuid.uuid4())
                current_order.save()

        except Exception as e:
            logger.error(f"VERIFICATION DB ERROR: {e}", exc_info=True)
            return Response({"error": f"Verification failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Send Emails (Async / Non-blocking)
        def run_safe_email(func, order):
            try:
                func(order)
            except Exception as e:
                logger.error(f"EMAIL THREAD ERROR ({func.__name__}): {e}")

        t_customer = threading.Thread(target=run_safe_email, args=(send_customer_email, current_order))
        t_admin = threading.Thread(target=run_safe_email, args=(send_admin_email, current_order))
        t_customer.daemon = True
        t_admin.daemon = True
        t_customer.start()
        t_admin.start()

        serializer = OrderSerializer(current_order)
        return Response({
            "message": "Payment verified successfully",
            "order": serializer.data
        }, status=status.HTTP_200_OK)


# =============================================================================
# Paystack Webhook (already hardened with WebhookLog)
# =============================================================================

class PaystackWebhookView(APIView):
    """
    Receives payment notifications directly from Paystack.
    This is the AUTHORITATIVE source of payment confirmation.

    SECURITY:
    - CSRF exempt (Paystack servers don't have Django sessions)
    - No Django authentication required (validated via HMAC signature instead)
    - Signature verification ensures only genuine Paystack requests are processed
    """
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        # 1. Log the Raw Request (The "Inbox" Step)
        client_ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR', ''))

        log_entry = WebhookLog.objects.create(
            provider='paystack',
            payload=request.data,
            headers=dict(request.headers),
            ip_address=client_ip.split(',')[0].strip() if client_ip else None
        )

        # 2. Verify Webhook Signature
        paystack_signature = request.headers.get('x-paystack-signature', '')

        if not paystack_signature:
            logger.warning("WEBHOOK: Missing signature header")
            log_entry.status = 'ignored'
            log_entry.processing_error = "Missing signature header"
            log_entry.save()
            return Response({"error": "Missing signature"}, status=status.HTTP_400_BAD_REQUEST)

        secret = settings.PAYSTACK_SECRET_KEY.encode('utf-8')
        computed_signature = hmac.new(
            secret,
            request.body,
            hashlib.sha512
        ).hexdigest()

        if not hmac.compare_digest(paystack_signature, computed_signature):
            logger.warning("WEBHOOK: Invalid signature")
            log_entry.status = 'ignored'
            log_entry.processing_error = "Invalid HMAC signature"
            log_entry.save()
            return Response({"error": "Invalid signature"}, status=status.HTTP_401_UNAUTHORIZED)

        # 3. Parse Event Data
        try:
            event_type = request.data.get('event', '')
            data = request.data.get('data', {})
            reference = data.get('reference', '')

            log_entry.event_type = event_type
            log_entry.reference = reference
            log_entry.save()

            logger.info(f"WEBHOOK: Received {event_type} for reference {reference}")

        except Exception as e:
            logger.error(f"WEBHOOK: Failed to parse payload - {e}")
            log_entry.status = 'failed'
            log_entry.processing_error = f"Payload parsing error: {str(e)}"
            log_entry.save()
            return Response({"error": "Invalid payload"}, status=status.HTTP_400_BAD_REQUEST)

        # 4. Handle charge.success Event
        if event_type == 'charge.success':
            if not reference:
                log_entry.status = 'ignored'
                log_entry.processing_error = "Event missing reference"
                log_entry.save()
                return Response({"error": "Missing reference"}, status=status.HTTP_400_BAD_REQUEST)

            # FIX (Feb 2026): Idempotency check — skip if this reference
            # was already successfully processed by a previous webhook delivery.
            if WebhookLog.objects.filter(
                reference=reference,
                status='processed'
            ).exclude(id=log_entry.id).exists():
                log_entry.status = 'ignored'
                log_entry.processing_error = "Already processed (idempotent skip)"
                log_entry.save()
                logger.info(f"WEBHOOK: Skipping duplicate delivery for {reference}")
                return Response({"status": "already_processed"}, status=status.HTTP_200_OK)

            try:
                order = Order.objects.get(paystack_reference=reference)

                if order.status == 'PAID':
                    log_entry.status = 'ignored'
                    log_entry.processing_error = "Order already PAID"
                    log_entry.save()
                    return Response({"status": "already_processed"}, status=status.HTTP_200_OK)

                # FIX: Verify amount from webhook payload matches order
                webhook_amount_kobo = data.get('amount', 0)
                expected_amount_kobo = int(order.total_amount * 100)

                if webhook_amount_kobo != expected_amount_kobo:
                    logger.critical(
                        f"WEBHOOK AMOUNT MISMATCH: Order #{order.id} expected {expected_amount_kobo}, "
                        f"webhook says {webhook_amount_kobo}. Reference: {reference}"
                    )
                    log_entry.status = 'failed'
                    log_entry.processing_error = (
                        f"Amount mismatch: expected {expected_amount_kobo}, got {webhook_amount_kobo}"
                    )
                    log_entry.save()
                    return Response({"status": "amount_mismatch"}, status=status.HTTP_200_OK)

                # Process payment
                verify_view = VerifyPaymentView()
                result = verify_view._complete_verification(order)

                if result.status_code == 200:
                    log_entry.status = 'processed'
                    log_entry.save()
                    logger.info(f"WEBHOOK: Order #{order.id} marked as PAID")
                else:
                    log_entry.status = 'failed'
                    log_entry.processing_error = f"Verification failed: {result.data}"
                    log_entry.save()

                return Response({"status": "processed"}, status=status.HTTP_200_OK)

            except Order.DoesNotExist:
                logger.warning(f"WEBHOOK: No order found for reference {reference}")
                log_entry.status = 'ignored'
                log_entry.processing_error = "Order not found"
                log_entry.save()
                return Response({"status": "order_not_found"}, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"WEBHOOK: Error processing charge.success - {e}")
                log_entry.status = 'failed'
                log_entry.processing_error = str(e)
                log_entry.save()
                return Response({"status": "error_logged"}, status=status.HTTP_200_OK)

        log_entry.status = 'ignored'
        log_entry.processing_error = f"Event type {event_type} not handled"
        log_entry.save()
        return Response({"status": "event_ignored"}, status=status.HTTP_200_OK)


# =============================================================================
# Utility Views
# =============================================================================

class HealthCheckView(APIView):
    """Health check endpoint to diagnose database connectivity."""
    def get(self, request):
        from django.db import connection

        try:
            db_engine = settings.DATABASES['default']['ENGINE']
            db_name = settings.DATABASES['default'].get('NAME', 'Unknown')
            product_count = Product.objects.count()
            order_count = Order.objects.count()
            is_production = 'postgresql' in db_engine.lower() or 'postgres' in db_engine.lower()

            return Response({
                "status": "healthy",
                "database_engine": db_engine,
                "database_name": str(db_name)[:50],
                "is_production_db": is_production,
                "product_count": product_count,
                "order_count": order_count,
                "warning": None if is_production else "DANGER: Using SQLite! Data will be lost on restart."
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "status": "unhealthy",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ValidateCouponView(APIView):
    """Validate a coupon code and return discount information."""
    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        cart_total = request.data.get('cart_total', 0)

        if not code:
            return Response({
                "valid": False,
                "message": "Please enter a coupon code"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({
                "valid": False,
                "message": "Invalid coupon code"
            }, status=status.HTTP_404_NOT_FOUND)

        if not coupon.is_valid():
            if not coupon.is_active:
                message = "This coupon has been deactivated"
            elif coupon.times_used >= coupon.max_uses:
                message = "This coupon has reached its usage limit"
            else:
                message = "This coupon has expired"

            return Response({
                "valid": False,
                "message": message
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            cart_total = float(cart_total)
        except (ValueError, TypeError):
            cart_total = 0

        discount_amount = round(cart_total * (coupon.discount_percent / 100), 2)
        new_total = round(cart_total - discount_amount, 2)

        return Response({
            "valid": True,
            "code": coupon.code,
            "discount_percent": coupon.discount_percent,
            "discount_amount": discount_amount,
            "new_total": new_total,
            "owner_name": coupon.owner_name,
            "owner_role": coupon.owner_role,
            "remaining_uses": coupon.get_remaining_uses(),
            "message": f"{coupon.discount_percent}% discount applied!"
        }, status=status.HTTP_200_OK)
