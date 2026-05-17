"""
Shop Celery tasks.

Scheduled tasks that run automatically via Celery Beat.
"""

import logging
from celery import shared_task
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)


@shared_task(
    name='shop.expire_pending_orders',
    bind=True,
    max_retries=0,       # Never retry — the task is idempotent and runs every hour anyway
    ignore_result=True,  # We don't need to store the return value in the result backend
)
def expire_pending_orders(self):
    """
    Mark PENDING orders older than 24 hours as FAILED.

    Runs every hour via Celery Beat (configured in settings.CELERY_BEAT_SCHEDULE).
    Uses a single atomic UPDATE query — no per-object save() loops, no race conditions.

    Idempotent: running it twice in a row is safe. The second run simply updates 0 rows.
    Only PENDING orders are affected. PAID and FULFILLED orders are never touched.
    """
    try:
        # Import inside the task to avoid circular imports at module load time
        from shop.models import Order

        threshold = timezone.now() - timedelta(hours=24)

        # Single atomic UPDATE — far safer than a queryset loop + save()
        # because it avoids the TOCTOU race between count() and update().
        updated = Order.objects.filter(
            status='PENDING',
            created_at__lt=threshold
        ).update(status='FAILED')

        if updated == 0:
            logger.info('ORDER CLEANUP: No stale PENDING orders found.')
        else:
            logger.info(
                'ORDER CLEANUP: Marked %d PENDING order(s) as FAILED '
                '(older than 24 hours).', updated
            )

        return updated

    except Exception as exc:
        # Log the full traceback so it appears in server logs.
        # Do NOT re-raise — we set max_retries=0 but even so, letting an
        # exception propagate would mark the task as FAILURE in Celery's
        # result backend and generate noisy alerts. We handle it here.
        logger.error(
            'ORDER CLEANUP: Task failed with an unexpected error: %s',
            exc,
            exc_info=True
        )
        return 0
