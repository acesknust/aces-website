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
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Product, Category, Order, OrderItem
from .serializers import ProductSerializer, CategorySerializer, OrderSerializer
from .utils import generate_qr_code, send_order_email

class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer

class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    lookup_field = 'slug'

class CreateOrderView(APIView):
    def post(self, request):
        data = request.data
        cart_items = data.get('items', [])
        user_details = data.get('user_details', {})
        
        if not cart_items:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Calculate Total Price on Backend
        total_amount = 0
        order_items_data = [] # Store (product, quantity, price) tuples

        for item in cart_items:
            product_id = item.get('id')
            quantity = item.get('quantity', 1)
            
            try:
                product = Product.objects.get(id=product_id, is_active=True)
                # Check stock if needed (omitted for simplicity as per plan)
                price = product.price
                total_amount += price * quantity
                order_items_data.append((product, quantity, price))
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

        for product, quantity, price in order_items_data:
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=price
            )

        # 3. Initialize Paystack Transaction
        paystack_url = "https://api.paystack.co/transaction/initialize"
        headers = {
            "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        
        # Amount in kobo (GHS * 100)
        amount_kobo = int(total_amount * 100)
        callback_url = f"{settings.CORS_ALLOWED_ORIGINS[0]}/shop/success" # Redirect to frontend success page
        
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

        try:
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
        
        try:
            response = requests.get(paystack_url, headers=headers)
            res_data = response.json()
            
            if res_data['status'] and res_data['data']['status'] == 'success':
                # Payment successful
                # Find order by reference (or metadata if needed)
                # Note: Paystack might return a different reference if it changed, but usually it matches
                # Better to use metadata order_id if possible, but let's try reference first
                
                try:
                    order = Order.objects.get(paystack_reference=reference)
                except Order.DoesNotExist:
                    # Fallback: try to find by email and amount if reference mismatch (rare)
                    return Response({"error": "Order not found for reference"}, status=status.HTTP_404_NOT_FOUND)
                
                if order.status != 'PAID':
                    order.status = 'PAID'
                    # Generate Verification Code (UUID)
                    order.verification_code = str(uuid.uuid4())
                    order.save()
                    
                    # Generate QR Code
                    qr_code = generate_qr_code(order.verification_code)
                    
                    # Send Email
                    send_order_email(order, qr_code)
                    
                    serializer = OrderSerializer(order)
                    return Response({
                        "message": "Payment verified successfully",
                        "order": serializer.data,
                        "qr_code": qr_code
                    }, status=status.HTTP_200_OK)
                else:
                     # Already paid
                    qr_code = generate_qr_code(order.verification_code)
                    serializer = OrderSerializer(order)
                    return Response({
                        "message": "Order already paid",
                        "order": serializer.data,
                        "qr_code": qr_code
                    }, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Payment verification failed"}, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
