from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
import sys

class Command(BaseCommand):
    help = 'Test email configuration'

    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='The email address to send to')

    def handle(self, *args, **options):
        email_address = options['email']
        self.stdout.write(f"Attempting to send email to {email_address}...")
        self.stdout.write(f"Using Host: {settings.EMAIL_HOST}")
        self.stdout.write(f"Using Port: {settings.EMAIL_PORT}")
        self.stdout.write(f"Using User: {settings.EMAIL_HOST_USER}")

        try:
            send_mail(
                'Test Email from ACES Shop',
                'This is a test email to verify SMTP settings. If you received this, it works!',
                settings.EMAIL_HOST_USER,
                [email_address],
                fail_silently=False,
            )
            self.stdout.write(self.style.SUCCESS('Successfully sent test email!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to send email: {e}'))
