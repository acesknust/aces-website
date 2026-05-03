from django.db import models
from django.conf import settings
from io import BytesIO
from PIL import Image as PILImage, ImageOps
from django.core.files.base import ContentFile


class BusinessCategory(models.TextChoices):
    FOOD = 'Food & Beverages', 'Food & Beverages'
    FASHION = 'Fashion & Apparel', 'Fashion & Apparel'
    TECH = 'Technology & Electronics', 'Technology & Electronics'
    SERVICES = 'Services (Design, Tutoring, etc)', 'Services'
    BEAUTY = 'Beauty & Cosmetics', 'Beauty & Cosmetics'
    OTHER = 'Other', 'Other'


def optimize_image(image_field, max_width=1200, max_height=1200, quality=85, crop=False):
    """
    Resize and optimize an uploaded image:
    - Converts to RGB (strips alpha for JPEG compat)
    - Resizes to fit within max_width x max_height while preserving aspect ratio (or crops if crop=True)
    - Compresses as WebP for optimal file size
    Returns a new ContentFile with the optimized image, or None if no processing needed.
    """
    if not image_field:
        return None

    try:
        img = PILImage.open(image_field)
    except Exception:
        return None  # If we can't open it, let Django handle the raw file

    # Convert RGBA/P to RGB for broad compatibility
    if img.mode in ('RGBA', 'P', 'LA'):
        background = PILImage.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if 'A' in img.mode else None)
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    # Resize or crop
    if crop:
        img = ImageOps.fit(img, (max_width, max_height), method=PILImage.LANCZOS, bleed=0.0, centering=(0.5, 0.5))
    elif img.width > max_width or img.height > max_height:
        img.thumbnail((max_width, max_height), PILImage.LANCZOS)

    # Save as optimized WebP
    buffer = BytesIO()
    img.save(buffer, format='WEBP', quality=quality, optimize=True)
    buffer.seek(0)

    # Generate new filename with .webp extension
    original_name = image_field.name.rsplit('.', 1)[0]
    new_name = f"{original_name}.webp"

    return ContentFile(buffer.read(), name=new_name)


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

        # Auto-generate unique slug
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Business.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        # Optimize logo (max 400x400 for thumbnails, exact square)
        if self.logo and not getattr(self.logo, '_committed', True):
            optimized = optimize_image(self.logo, max_width=400, max_height=400, quality=85, crop=True)
            if optimized:
                self.logo = optimized

        # Optimize banner (1400x600 for wide banners, exact 7:3 ratio)
        if self.banner and not getattr(self.banner, '_committed', True):
            optimized = optimize_image(self.banner, max_width=1400, max_height=600, quality=80, crop=True)
            if optimized:
                self.banner = optimized

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

    def save(self, *args, **kwargs):
        # Optimize product image (max 800x800 for product cards)
        if self.image and not getattr(self.image, '_committed', True):
            optimized = optimize_image(self.image, max_width=800, max_height=800, quality=85)
            if optimized:
                self.image = optimized

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.business.name}"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='additional_images')
    image = models.ImageField(upload_to='student_businesses/products/gallery/')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def save(self, *args, **kwargs):
        if self.image and not getattr(self.image, '_committed', True):
            optimized = optimize_image(self.image, max_width=800, max_height=800, quality=85)
            if optimized:
                self.image = optimized
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Gallery image for {self.product.name}"
