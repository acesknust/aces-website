# Expose Celery app so Django's @shared_task decorator works in all apps
from .celery import app as celery_app

__all__ = ('celery_app',)
