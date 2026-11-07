"""
Marks stale PENDING orders as FAILED.

Usage:
    python manage.py cleanup_orders           # Default: 24 hours
    python manage.py cleanup_orders --hours 12
    python manage.py cleanup_orders --dry-run  # Preview without changing
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from shop.models import Order


class Command(BaseCommand):
    help = 'Mark stale PENDING orders as FAILED (prevents admin clutter from duplicate checkout clicks)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--hours',
            type=int,
            default=24,
            help='Mark PENDING orders older than this many hours as FAILED (default: 24)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Preview which orders would be cleaned up without changing anything',
        )

    def handle(self, *args, **options):
        hours = options['hours']
        dry_run = options['dry_run']
        threshold = timezone.now() - timedelta(hours=hours)

        stale_orders = Order.objects.filter(
            status='PENDING',
            created_at__lt=threshold
        )

        count = stale_orders.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS(
                f"No stale PENDING orders older than {hours} hours found."
            ))
            return

        if dry_run:
            self.stdout.write(self.style.WARNING(
                f"[DRY RUN] Would mark {count} stale orders as FAILED:"
            ))
            for order in stale_orders[:20]:
                self.stdout.write(
                    f"  - Order #{order.id}: {order.full_name} "
                    f"({order.email}) — created {order.created_at}"
                )
            if count > 20:
                self.stdout.write(f"  ... and {count - 20} more")
        else:
            updated = stale_orders.update(status='FAILED')
            self.stdout.write(self.style.SUCCESS(
                f"Cleanup complete: Marked {updated} stale PENDING orders as FAILED."
            ))
