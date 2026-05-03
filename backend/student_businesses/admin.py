from django.contrib import admin
from .models import Business, Product


class ProductInline(admin.TabularInline):
    """Read-only inline view of products within a business."""
    model = Product
    extra = 0
    readonly_fields = ('name', 'category', 'description', 'price', 'image', 'is_available', 'created_at')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    """
    Admin view for businesses.
    Admins can ONLY approve/deny businesses — they cannot edit vendor information.
    """
    list_display = ('name', 'owner', 'whatsapp_number', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'created_at')
    search_fields = ('name', 'owner__email', 'owner__username', 'description')
    list_editable = ('is_approved',)  # Quick toggle from list view
    inlines = [ProductInline]
    actions = ['approve_businesses', 'unapprove_businesses']

    # Make ALL fields read-only so admins can view but not edit vendor data
    readonly_fields = (
        'owner', 'name', 'slug', 'description', 'banner', 'payment_method',
        'logo', 'whatsapp_number', 'instagram_handle', 'created_at',
    )

    def has_add_permission(self, request):
        """Admins should not create businesses — only vendors do that."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Admins should not delete businesses — only deny/unapprove them."""
        return False

    def get_fields(self, request, obj=None):
        """Show is_approved as the only editable field, followed by read-only details."""
        return [
            'is_approved',
            'name', 'owner', 'slug', 'description',
            'whatsapp_number', 'instagram_handle', 'payment_method',
            'logo', 'banner', 'created_at',
        ]

    def approve_businesses(self, request, queryset):
        count = queryset.update(is_approved=True)
        self.message_user(request, f"{count} business(es) approved.")
    approve_businesses.short_description = "✅ Approve selected businesses"

    def unapprove_businesses(self, request, queryset):
        count = queryset.update(is_approved=False)
        self.message_user(request, f"{count} business(es) unapproved.")
    unapprove_businesses.short_description = "❌ Unapprove selected businesses"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Read-only view of products for admin reference."""
    list_display = ('name', 'business', 'category', 'price', 'is_available', 'created_at')
    list_filter = ('is_available', 'category', 'business')
    search_fields = ('name', 'business__name')
    readonly_fields = ('business', 'name', 'category', 'description', 'price', 'image', 'is_available', 'created_at')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
