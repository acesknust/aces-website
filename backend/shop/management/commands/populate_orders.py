from django.core.management.base import BaseCommand
from shop.models import Order, OrderItem, Product, Category
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Populates the database with test orders to verify status workflow'

    def handle(self, *args, **kwargs):
        self.stdout.write("Creating test data...")
        
        # Ensure we have a category and product
        category, _ = Category.objects.get_or_create(name="Test Category")
        product, _ = Product.objects.get_or_create(
            name="Test T-Shirt",
            defaults={'price': 50.00, 'description': 'Test Item', 'is_active': True, 'category': category}
        )
        # Handle case where product exists but might not have category (if old schema) - simpler just to trust get_or_create


        # 1. Create PENDING Orders (Should Block "Mark Complete")
        for i in range(2):
            order = Order.objects.create(
                full_name=f"Test Pending {i+1}",
                email=f"pending{i+1}@test.com",
                phone="0200000000",
                address="Unity Hall",
                total_amount=100.00,
                status='PENDING',
                paystack_reference=f"test-ref-pending-{random.randint(1000,9999)}"
            )
            OrderItem.objects.create(order=order, product=product, quantity=2, price=50.00)
            self.stdout.write(self.style.WARNING(f"Created PENDING Order #{order.id}"))

        # 2. Create PAID Orders (Should Allow "Mark Complete")
        for i in range(2):
            order = Order.objects.create(
                full_name=f"Test Paid {i+1}",
                email=f"paid{i+1}@test.com",
                phone="0240000000",
                address="Africa Hall",
                total_amount=50.00,
                status='PAID',
                paystack_reference=f"test-ref-paid-{random.randint(1000,9999)}"
            )
            OrderItem.objects.create(order=order, product=product, quantity=1, price=50.00)
            self.stdout.write(self.style.SUCCESS(f"Created PAID Order #{order.id}"))

        # 3. Create FULFILLED Order (Should Revert to PAID)
        order = Order.objects.create(
            full_name="Test Fulfilled",
            email="done@test.com",
            phone="0500000000",
            address="Queens Hall",
            total_amount=50.00,
            status='FULFILLED',
            completed_at=timezone.now(),
            paystack_reference=f"test-ref-done-{random.randint(1000,9999)}"
        )
        OrderItem.objects.create(order=order, product=product, quantity=1, price=50.00)
        self.stdout.write(self.style.SUCCESS(f"Created FULFILLED Order #{order.id}"))

        self.stdout.write(self.style.SUCCESS("Test data populated successfully! Go to Admin Panel to test."))
