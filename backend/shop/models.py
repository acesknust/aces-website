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
    has_sizes = models.BooleanField(default=True, help_text="Show size selector on product page (uncheck for caps, etc.)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class ProductSize(models.Model):
    """
    Custom sizes for individual products.
    Allows different size options per product (e.g., S/M/L for shirts, 7/8/9 for shoes).
    """
    product = models.ForeignKey(Product, related_name='sizes', on_delete=models.CASCADE)
    name = models.CharField(max_length=20, verbose_name="Size Label (e.g., S, M, 42)", help_text="Enter the size here (e.g., 'Small', 'S', '44')")
    display_order = models.PositiveIntegerField(default=0, verbose_name="Sort Order", help_text="e.g. 1 for Small, 2 for Medium")
    is_available = models.BooleanField(default=True, verbose_name="In Stock?")

    class Meta:
        ordering = ['display_order', 'name']
        unique_together = ['product', 'name']
        verbose_name = "Product Size"
        verbose_name_plural = "Product Sizes"

    def __str__(self):
        return f"{self.product.name} - {self.name}"

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
    
    # Coupon/Discount fields (optional)
    coupon = models.ForeignKey(
        'Coupon', 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name='orders',
        help_text="Applied discount coupon (if any)"
    )
    discount_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        help_text="Discount amount applied to this order"
    )

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


class Coupon(models.Model):
    """
    Discount coupon for ACES Committee Heads.
    Each coupon is personal and tied to a specific committee member.
    """
    code = models.CharField(
        max_length=50, 
        unique=True, 
        db_index=True,
        help_text="Unique coupon code (auto-generated or custom)"
    )
    owner_name = models.CharField(
        max_length=100, 
        help_text="Full name of the Committee Head"
    )
    owner_role = models.CharField(
        max_length=100, 
        help_text="Role in ACES (e.g., President, Secretary, Treasurer)"
    )
    discount_percent = models.PositiveIntegerField(
        default=10,
        help_text="Discount percentage (e.g., 10 for 10% off)"
    )
    max_uses = models.PositiveIntegerField(
        default=1,
        help_text="Maximum number of times this coupon can be used"
    )
    times_used = models.PositiveIntegerField(
        default=0,
        help_text="Number of times this coupon has been used"
    )
    expires_at = models.DateTimeField(
        help_text="Coupon expiration date and time"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Whether this coupon is currently active"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Coupon"
        verbose_name_plural = "Coupons"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} - {self.owner_name} ({self.owner_role})"

    def is_valid(self):
        """Check if coupon can still be used."""
        from django.utils import timezone
        if not self.is_active:
            return False
        if self.times_used >= self.max_uses:
            return False
        if timezone.now() >= self.expires_at:
            return False
        return True

    def get_remaining_uses(self):
        """Return how many uses are left."""
        return max(0, self.max_uses - self.times_used)

    @staticmethod
    def generate_unique_code(owner_name, owner_role):
        """
        Generate a secure, unique coupon code.
        Format: ACES-{ROLE_PREFIX}-{RANDOM}
        Example: ACES-PRES-A7X9
        """
        import secrets
        import string
        
        # Create role prefix (first 4 letters uppercase)
        role_prefix = ''.join(c for c in owner_role.upper() if c.isalpha())[:4]
        if not role_prefix:
            role_prefix = "COMM"
        
        # Generate random suffix (4 alphanumeric characters)
        random_suffix = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(4))
        
        return f"ACES-{role_prefix}-{random_suffix}"

