"""
Removes old webhook log entries to prevent database bloat.

Usage:
    python manage.py cleanup_webhook_logs              # Delete logs older than 90 days
    python manage.py cleanup_webhook_logs --days 30    # Custom retention period
    python manage.py cleanup_webhook_logs --dry-run    # Preview without deleting
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from payment_logs.models import WebhookLog


class Command(BaseCommand):
    help = 'Delete old webhook log entries to prevent database bloat (default: keep 90 days)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=90,
            help='Delete webhook logs older than this many days (default: 90)',
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Preview which logs would be deleted without changing anything',
        )

    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        cutoff = timezone.now() - timedelta(days=days)

        old_logs = WebhookLog.objects.filter(created_at__lt=cutoff)
        count = old_logs.count()

        if count == 0:
            self.stdout.write(self.style.SUCCESS(
                f"No webhook logs older than {days} days found."
            ))
            return

        # Show stats before deletion
        stats = {}
        for log in old_logs.values_list('status', flat=True):
            stats[log] = stats.get(log, 0) + 1

        self.stdout.write(f"Found {count} webhook logs older than {days} days:")
        for status_val, cnt in sorted(stats.items()):
            self.stdout.write(f"  - {status_val}: {cnt}")

        if dry_run:
            self.stdout.write(self.style.WARNING(
                f"[DRY RUN] Would delete {count} logs. No changes made."
            ))
        else:
            deleted, _ = old_logs.delete()
            self.stdout.write(self.style.SUCCESS(
                f"Cleanup complete: Deleted {deleted} webhook log entries."
            ))
