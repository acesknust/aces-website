"""
Django settings for core project.
"""

from pathlib import Path
import os
from azure.storage.blob import BlobServiceClient
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

    # Local
    'users.apps.UsersConfig',
    'scholarship.apps.ScholarshipConfig',
    'event.apps.EventConfig',
    'shop.apps.ShopConfig',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
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
    ]
}

CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', 'http://localhost:3000').split(',')

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
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER