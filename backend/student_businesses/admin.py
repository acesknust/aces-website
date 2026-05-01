from django.contrib import admin
from .models import Business, Product

class ProductInline(admin.TabularInline):
    model = Product
    extra = 1

@admin.register(Business)
class BusinessAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'whatsapp_number', 'is_approved', 'created_at')
    list_filter = ('is_approved',)
    search_fields = ('name', 'owner__email', 'description')
    inlines = [ProductInline]
    prepopulated_fields = {'slug': ('name',)}
    actions = ['approve_businesses', 'unapprove_businesses']

    def approve_businesses(self, request, queryset):
        queryset.update(is_approved=True)
    approve_businesses.short_description = "Approve selected businesses"

    def unapprove_businesses(self, request, queryset):
        queryset.update(is_approved=False)
    unapprove_businesses.short_description = "Unapprove selected businesses"

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'business', 'category', 'price', 'is_available')
    list_filter = ('is_available', 'category', 'business')
    search_fields = ('name', 'business__name')
