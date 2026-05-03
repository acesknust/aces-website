# Generated manually

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Business',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('slug', models.SlugField(blank=True, unique=True)),
                ('description', models.TextField()),
                ('category', models.CharField(choices=[('Food & Beverages', 'Food & Beverages'), ('Fashion & Apparel', 'Fashion & Apparel'), ('Technology & Electronics', 'Technology & Electronics'), ('Services (Design, Tutoring, etc)', 'Services'), ('Beauty & Cosmetics', 'Beauty & Cosmetics'), ('Other', 'Other')], default='Other', max_length=50)),
                ('logo', models.ImageField(blank=True, null=True, upload_to='student_businesses/logos/')),
                ('whatsapp_number', models.CharField(help_text='Include country code, e.g., 233541234567', max_length=20)),
                ('instagram_handle', models.CharField(blank=True, help_text='e.g., @aces_knust', max_length=100, null=True)),
                ('is_approved', models.BooleanField(default=False, help_text='Executives must approve before it appears publicly')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='businesses', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'Businesses',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('image', models.ImageField(upload_to='student_businesses/products/')),
                ('is_available', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('business', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='products', to='student_businesses.business')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
