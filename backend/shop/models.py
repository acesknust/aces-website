from django.db import models
from django.conf import settings
from django.utils.text import slugify
import uuid

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = "Categories"

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    image_color = models.CharField(max_length=50, blank=True, null=True, help_text="Color of the main image (e.g. Black)")
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed'),
        ('FULFILLED', 'Fulfilled'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING', db_index=True)
    
    paystack_reference = models.CharField(max_length=100, unique=True, blank=True, null=True)
    verification_code = models.CharField(max_length=100, unique=True, blank=True, null=True) # For QR Code
    
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    completed_at = models.DateTimeField(null=True, blank=True, help_text="Timestamp when order was prepared/completed")
    delivered_at = models.DateTimeField(null=True, blank=True, help_text="Timestamp when order was delivered")

    def __str__(self):
        return f"Order {self.id} - {self.full_name} ({self.status})"

class ProductImage(models.Model):
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/variants/')
    color = models.CharField(max_length=50, blank=True, null=True, help_text="Optional color name (e.g. Red)")
    
    def __str__(self):
        return f"{self.product.name} - {self.color or 'Image'}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2) # Snapshot of price at purchase
    quantity = models.PositiveIntegerField(default=1)
    selected_color = models.CharField(max_length=50, blank=True, null=True)
    selected_size = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        color_info = f" ({self.selected_color})" if self.selected_color else ""
        size_info = f" [{self.selected_size}]" if self.selected_size else ""
        return f"{self.quantity} x {self.product.name}{color_info}{size_info}"
