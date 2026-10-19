from django.core.management.base import BaseCommand
from shop.models import Order
from shop.utils import send_admin_email
from django.conf import settings

class Command(BaseCommand):
    help = 'Sends a test email to the configured ADMIN_EMAIL'

    def handle(self, *args, **kwargs):
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'Not Set')
        self.stdout.write(f"Configuration Check: Sending to {admin_email}...")
        
        # Get latest order
        order = Order.objects.last()
        if not order:
            self.stdout.write(self.style.ERROR("No orders found in database. Run 'populate_orders' first."))
            return

        try:
            self.stdout.write(f"Sending Admin notification for Order #{order.id}...")
            send_admin_email(order)
            self.stdout.write(self.style.SUCCESS(f"✅ Email sent successfully to {admin_email}! Check your inbox."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Failed to send email: {str(e)}"))
