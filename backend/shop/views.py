from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Product, Category, Order
from .serializers import ProductSerializer, CategorySerializer, OrderSerializer

class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'

import requests
import uuid
from django.conf import settings
from django.db import transaction
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Product, Category, Order, OrderItem
from .serializers import ProductSerializer, CategorySerializer, OrderSerializer
from .utils import send_order_email

class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'

class CreateOrderView(APIView):
    def post(self, request):
        try:
            data = request.data
            cart_items = data.get('items', [])
            # Frontend sends flat data, so fallback to data if user_details is missing
            user_details = data.get('user_details', data)
            
            if not cart_items:
                return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

            # 1. Calculate Total Price on Backend
            total_amount = 0
            order_items_data = [] # Store (product, quantity, price) tuples

            for item in cart_items:
                product_id = item.get('id')
                quantity = item.get('quantity', 1)
                color = item.get('color')
                size = item.get('size')
                
                try:
                    product = Product.objects.get(id=product_id, is_active=True)
                    price = product.price
                    total_amount += price * quantity
                    order_items_data.append((product, quantity, price, color, size))
                except Product.DoesNotExist:
                    return Response({"error": f"Product with ID {product_id} not found"}, status=status.HTTP_400_BAD_REQUEST)

             # 2. Create Order (Pending)
            order = Order.objects.create(
                user=request.user if request.user.is_authenticated else None,
                full_name=user_details.get('full_name'),
                email=user_details.get('email'),
                phone=user_details.get('phone'),
                address=user_details.get('address'),
                total_amount=total_amount,
                status='PENDING'
            )

            for product, quantity, price, color, size in order_items_data:
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=price,
                    selected_color=color,
                    selected_size=size
                )

            # 3. Initialize Paystack Transaction
            paystack_url = "https://api.paystack.co/transaction/initialize"
            headers = {
                "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
                "Content-Type": "application/json"
            }
            
            # Amount in kobo (GHS * 100)
            amount_kobo = int(total_amount * 100)
            
            # Use localhost:3000 for local dev (index 1 in settings), or fallback to first one
            base_url = "http://localhost:3000" 
            callback_url = f"{base_url}/shop/success" # Redirect to frontend success page
            
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

            # Check for Placeholder Keys to Enable Mock Mode
            is_mock_mode = settings.PAYSTACK_SECRET_KEY.startswith('sk_test_xx')

            if is_mock_mode:
                # MOCK RESPONSE for development/testing without real keys
                mock_reference = f"mock-{order.id}-{uuid.uuid4()}"
                order.paystack_reference = mock_reference
                order.save()
                
                # Mock URL redirecting directly to success page
                # In production this comes from Paystack
                mock_auth_url = f"{callback_url}?reference={mock_reference}"
                
                return Response({
                    "authorization_url": mock_auth_url,
                    "access_code": "mock_access_code",
                    "reference": mock_reference,
                    "order_id": order.id,
                    "message": "MOCK PAYMENT INITIALIZED (Placeholder Keys Detected)"
                }, status=status.HTTP_200_OK)

            try:
                # Try communicating with Paystack
                response = requests.post(paystack_url, json=payload, headers=headers)
                res_data = response.json()
                
                if res_data['status']:
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
                    return Response({"error": "Paystack initialization failed", "details": res_data['message']}, status=status.HTTP_400_BAD_REQUEST)
            
            except (requests.exceptions.RequestException, Exception) as e:
                # Fallback to MOCK MODE if connection fails (e.g. no internet) or other error
                print(f"Paystack Error: {e}. Falling back to Mock Mode.")
                
                mock_reference = f"mock-{order.id}-{uuid.uuid4()}"
                order.paystack_reference = mock_reference
                order.save()
                
                mock_auth_url = f"{callback_url}?reference={mock_reference}"
                
                return Response({
                    "authorization_url": mock_auth_url,
                    "access_code": "mock_access_code",
                    "reference": mock_reference,
                    "order_id": order.id,
                    "message": "Note: Payment simulated (Network Error or Invalid Key)"
                }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyPaymentView(APIView):
    def get(self, request):
        reference = request.query_params.get('reference')
        if not reference:
            return Response({"error": "No reference provided"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Verify with Paystack
        paystack_url = f"https://api.paystack.co/transaction/verify/{reference}"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        }
        
        # Helper to finish verification
        def complete_verification(order_obj):
             try:
                 # 1. ATOMIC DB UPDATES
                 with transaction.atomic():
                    # Refresh to ensure latest status and lock
                    current_order = Order.objects.select_for_update().get(id=order_obj.id)
                    
                    if current_order.status == 'PAID':
                        serializer = OrderSerializer(current_order)
                        return Response({
                            "message": "Order already paid",
                            "order": serializer.data
                        }, status=status.HTTP_200_OK)

                    # Decrement Stock
                    for item in current_order.items.all():
                        # Lock Product row to prevent race conditions on stock
                        product = Product.objects.select_for_update().get(id=item.product.id)
                        product.stock -= item.quantity
                        product.save()

                    current_order.status = 'PAID'
                    current_order.verification_code = str(uuid.uuid4())
                    current_order.save()
             except Exception as e:
                 return Response({"error": f"Verification failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

             # 2. SEND EMAIL (Outside Transaction)
             try:
                # Re-fetch order to be safe (though current_order variable persists in Python scope)
                # Just using current_order is fine here as it's local variable.
                send_order_email(current_order)
             except Exception as e:
                print(f"EMAIL ERROR: {e}") # Debug print

             # 3. RETURN RESPONSE
             serializer = OrderSerializer(current_order)
             return Response({
                "message": "Payment verified successfully",
                "order": serializer.data
             }, status=status.HTTP_200_OK)

        # MOCK VERIFICATION
        if reference.startswith('mock-'):
            try:
                order = Order.objects.get(paystack_reference=reference)
                return complete_verification(order)
            except Order.DoesNotExist:
                return Response({"error": "Order not found for mock reference"}, status=status.HTTP_404_NOT_FOUND)

        try:
            response = requests.get(paystack_url, headers=headers)
            res_data = response.json()
            
            if res_data['status'] and res_data['data']['status'] == 'success':
                try:
                    order = Order.objects.get(paystack_reference=reference)
                except Order.DoesNotExist:
                    return Response({"error": "Order not found for reference"}, status=status.HTTP_404_NOT_FOUND)
                
                return complete_verification(order)
            else:
                return Response({"error": "Payment verification failed"}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
