from django.db import models
from django.conf import settings
from uuid import uuid4

class BusinessCategory(models.TextChoices):
    FOOD = 'Food & Beverages', 'Food & Beverages'
    FASHION = 'Fashion & Apparel', 'Fashion & Apparel'
    TECH = 'Technology & Electronics', 'Technology & Electronics'
    SERVICES = 'Services (Design, Tutoring, etc)', 'Services'
    BEAUTY = 'Beauty & Cosmetics', 'Beauty & Cosmetics'
    OTHER = 'Other', 'Other'

class Business(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='businesses')
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    banner = models.ImageField(upload_to='student_businesses/banners/', blank=True, null=True)
    payment_method = models.TextField(blank=True, help_text="e.g., MTN MoMo: 0541234567 (Kwame)")
    logo = models.ImageField(upload_to='student_businesses/logos/', blank=True, null=True)
    whatsapp_number = models.CharField(max_length=20, help_text="Include country code, e.g., 233541234567")
    instagram_handle = models.CharField(max_length=100, blank=True, null=True, help_text="e.g., @aces_knust")
    is_approved = models.BooleanField(default=False, help_text="Executives must approve before it appears publicly")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Businesses'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        from django.utils.text import slugify
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Business.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Product(models.Model):
    business = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=BusinessCategory.choices, default=BusinessCategory.OTHER)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='student_businesses/products/')
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.business.name}"
