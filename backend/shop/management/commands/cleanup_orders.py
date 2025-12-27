from django.core.management.base import BaseCommand
from shop.models import Order
from django.utils import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Automatically specific Pending orders as Failed if older than 24 hours'

    def handle(self, *args, **kwargs):
        # Time threshold (48 hours ago)
        threshold = timezone.now() - timedelta(hours=48)
        
        # Find stale pending orders
        stale_orders = Order.objects.filter(
            status='PENDING',
            created_at__lt=threshold
        )
        
        count = stale_orders.count()
        
        if count > 0:
            updated = stale_orders.update(status='FAILED')
            self.stdout.write(self.style.SUCCESS(f"Cleanup: Marked {updated} stale pending orders as FAILED."))
        else:
            self.stdout.write(self.style.SUCCESS("Cleanup: No stale orders found."))
