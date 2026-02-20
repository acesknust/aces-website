"""
Django settings for core project.
"""

from pathlib import Path
import os
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-3=n18lj@f2ae3sbuap&k=$1$)(mfu7o8#thg5)h^$v2!acwvqn')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Local Apps
    'users.apps.UsersConfig',
    'scholarship.apps.ScholarshipConfig',
    'event.apps.EventConfig',
    'shop.apps.ShopConfig',
    'executives.apps.ExecutivesConfig',
    'courses.apps.CoursesConfig',
    'staff.apps.StaffConfig',
    'payment_logs.apps.PaymentLogsConfig',  # Webhook audit trail

    # Celery Beat — scheduled tasks (auto-expire pending orders, etc.)
    'django_celery_beat',
    'django_celery_results',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'storages',  # Required for DigitalOcean Spaces
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [ BASE_DIR / 'templates' ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

import dj_database_url
import sys

# Database Configuration
# In Production (DEBUG=False), we REQUIRE a real database.
# Falling back to SQLite in production is DANGEROUS on ephemeral filesystems.

# Check if we're in a build phase (collectstatic, migrate, etc.)
# During build, DATABASE_URL may not be available yet
IS_BUILD_PHASE = 'collectstatic' in sys.argv or 'migrate' in sys.argv

if DEBUG:
    # Development: Use SQLite for convenience
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
    print("DATABASE MODE: Development (SQLite)")
else:
    # Production: REQUIRE DATABASE_URL for runtime, but allow build phase to proceed
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        # DATABASE_URL is set, use PostgreSQL
        DATABASES = {
            'default': dj_database_url.config(
                default=database_url,
                conn_max_age=600,
                ssl_require=True
            )
        }
        print("DATABASE MODE: Production (PostgreSQL)")
    elif IS_BUILD_PHASE:
        # During build phase, use SQLite temporarily for collectstatic
        # This is safe because collectstatic doesn't need actual data
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
        print("DATABASE MODE: Build Phase (Temporary SQLite - OK)")
    else:
        # Runtime without DATABASE_URL - this is a fatal error
        raise Exception(
            "FATAL: DATABASE_URL environment variable is not set. "
            "Production deployments require a PostgreSQL database. "
            "Please configure DATABASE_URL in your environment."
        )

AUTH_PASSWORD_VALIDATORS = [
    { 'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator', },
    { 'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator', },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = (os.path.join(BASE_DIR, 'static'),)
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# DigitalOcean Spaces Configuration (S3-compatible) for Media Files
USE_SPACES = os.environ.get('USE_SPACES', 'False') == 'True'

if USE_SPACES:
    # Production: Use DigitalOcean Spaces for persistent media storage
    AWS_ACCESS_KEY_ID = os.environ.get('SPACES_ACCESS_KEY')
    AWS_SECRET_ACCESS_KEY = os.environ.get('SPACES_SECRET_KEY')
    AWS_STORAGE_BUCKET_NAME = os.environ.get('SPACES_BUCKET_NAME', 'aces-shop-media')
    AWS_S3_REGION_NAME = os.environ.get('SPACES_REGION', 'nyc3')
    AWS_S3_ENDPOINT_URL = f"https://{AWS_S3_REGION_NAME}.digitaloceanspaces.com"
    AWS_S3_OBJECT_PARAMETERS = {'CacheControl': 'max-age=86400'}
    AWS_DEFAULT_ACL = 'public-read'
    AWS_S3_FILE_OVERWRITE = False
    AWS_QUERYSTRING_AUTH = False
    
    # Use Spaces for media files
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    MEDIA_URL = f"https://{AWS_STORAGE_BUCKET_NAME}.{AWS_S3_REGION_NAME}.digitaloceanspaces.com/"
    print(f"MEDIA STORAGE: DigitalOcean Spaces ({AWS_STORAGE_BUCKET_NAME})")
else:
    # Local development: use filesystem
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
    print("MEDIA STORAGE: Local Filesystem")

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.CustomUser'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    # Rate Limiting — prevents brute-force on login, coupon guessing, order spam
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '30/minute',     # Anonymous users: 30 requests/min
        'user': '60/minute',     # Authenticated users: 60 requests/min
    },
}

CORS_ALLOWED_ORIGINS = [origin.strip() for origin in os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')]
# CORS_ALLOW_ALL_ORIGINS = True # Temporary for debugging
CSRF_TRUSTED_ORIGINS = [origin.strip() for origin in os.environ.get('CSRF_TRUSTED_ORIGINS', 'http://localhost:3000').split(',')]

SIMPLE_JWT = {
     'ACCESS_TOKEN_LIFETIME': timedelta(minutes=10),
     'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
     'ROTATE_REFRESH_TOKENS': True,
     'BLACKLIST_AFTER_ROTATION': True
}

PAYSTACK_PUBLIC_KEY = os.environ.get('PAYSTACK_PUBLIC_KEY')
PAYSTACK_SECRET_KEY = os.environ.get('PAYSTACK_SECRET_KEY')

# Email Configuration (SMTP)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend' # Debug Mode: Print to console
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', EMAIL_HOST_USER) # Default to host user if undefined

# =============================================================================
# Logging Configuration — persistent error logs
# =============================================================================
LOG_DIR = os.path.join(BASE_DIR, 'logs')
os.makedirs(LOG_DIR, exist_ok=True)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} {name} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(LOG_DIR, 'django.log'),
            'maxBytes': 5 * 1024 * 1024,  # 5 MB
            'backupCount': 3,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'WARNING',
        },
        'shop': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'payment_logs': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'shop.tasks': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# =============================================================================
# Celery Configuration
# Uses Redis as broker and result backend (redis is already in requirements).
# REDIS_URL must be set in production environment variables.
# =============================================================================
import ssl as _ssl

REDIS_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

CELERY_BROKER_URL = REDIS_URL
CELERY_RESULT_BACKEND = 'django-db'  # Stores results in DB via django-celery-results
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE  # Match Django's timezone (UTC)
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# redis 6.x changed SSL defaults: rediss:// URLs now require explicit cert config.
# Without this, the Celery worker crashes at startup with no logs on DigitalOcean.
# The connection is still fully TLS-encrypted; we only skip CA chain verification
# (acceptable for backend-to-managed-Redis traffic inside DigitalOcean's network).
if REDIS_URL.startswith('rediss://'):
    CELERY_BROKER_USE_SSL = {'ssl_cert_reqs': _ssl.CERT_NONE}
    CELERY_REDIS_BACKEND_USE_SSL = {'ssl_cert_reqs': _ssl.CERT_NONE}

# =============================================================================
# Celery Beat Schedule — Periodic Tasks
# NOTE: Uses timedelta (already imported at top) instead of crontab to avoid
# importing from Celery at settings-parse time, which can fail during builds.
# =============================================================================

CELERY_BEAT_SCHEDULE = {
    # Auto-expire PENDING orders older than 24 hours.
    # Runs every 60 minutes. Using timedelta avoids importing crontab at
    # module load time, which can cause startup failures if Celery is absent.
    'expire-pending-orders-hourly': {
        'task': 'shop.expire_pending_orders',
        'schedule': timedelta(hours=1),
    },
}
