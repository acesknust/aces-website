"""
Celery application for ACES backend.
Handles asynchronous and scheduled tasks (e.g., auto-expiring pending orders).
"""

import os
from celery import Celery

# Tell Celery which settings module to use
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('core')

# Load Celery settings from Django settings under the CELERY_ namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps (looks for tasks.py in each app)
app.autodiscover_tasks()
