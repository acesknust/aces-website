from django.core.management.base import BaseCommand
from django.conf import settings
from shop.utils import send_customer_email, send_admin_email
from shop.models import Order, Product, OrderItem
from datetime import datetime

class Command(BaseCommand):
    help = 'Test branded email configuration'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='The email address to send to')

    def handle(self, *args, **options):
        email_address = options['email']
        self.stdout.write(f"Sending branded test emails to {email_address}...")

        # Create Mock Order (in memory, or temporarily saved)
        # For simplicity, we can just create a dummy object structure if utils doesn't require DB persistence
        # But utils uses order.items.all(), so it needs DB relationships.
        # Let's create a temporary unsaved object? No, .all() works on RelatedManager.
        # Safest is to try to get the LAST order, or creating a fake one?
        # Let's try to get the latest order.
        
        try:
            order = Order.objects.last()
            if not order:
                self.stdout.write(self.style.WARNING('No orders found in DB. Creating a dummy order...'))
                # Create dummy product
                product, _ = Product.objects.get_or_create(
                    name="Test Product", 
                    defaults={'price': 100.00, 'description': 'Test', 'quantity': 10}
                )
                order = Order.objects.create(
                    full_name="Test User",
                    email=email_address,
                    phone="0555555555",
                    address="Test Address, KNUST",
                    total_amount=100.00,
                    status="PAID"
                )
                OrderItem.objects.create(order=order, product=product, price=100.00, quantity=1, selected_color="Blue", selected_size="L")
            else:
                # Update email to target
                order.email = email_address
                # Don't save, just use in memory? 
                # utils email sending uses order.email.
                # So we can modify the instance without saving
                pass

            self.stdout.write("Sending Customer Email...")
            send_customer_email(order)
            
            self.stdout.write("Sending Admin Email...")
            # Send admin email to the test address as well
            send_admin_email(order, admin_email=email_address)
            
            self.stdout.write(self.style.SUCCESS(f'Successfully sent customer receipt to {email_address}'))
            self.stdout.write(self.style.SUCCESS('Admin email was sent to the configured admin address.'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to send email: {e}'))
