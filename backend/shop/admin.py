from django.contrib import admin
from .models import Category, Product, Order, OrderItem, ProductImage

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'is_active']
    list_filter = ['category', 'is_active']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product']

import csv
from django.http import HttpResponse

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'full_name', 'phone', 'address', 'items_summary', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    inlines = [OrderItemInline]
    actions = ["export_as_csv"]

    def items_summary(self, obj):
        return ", ".join([f"{item.quantity}x {item.product.name} ({item.selected_color or ''}/{item.selected_size or ''})" for item in obj.items.all()])
    items_summary.short_description = "Ordered Items"

    def export_as_csv(self, request, queryset):
        meta = self.model._meta
        field_names = ['id', 'full_name', 'email', 'phone', 'address', 'total_amount', 'status', 'paystack_reference', 'created_at']

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename={}.csv'.format(meta)
        writer = csv.writer(response)

        # Header
        writer.writerow(field_names + ['Ordered Items'])

        for obj in queryset:
            # Generate items string
            items_str = "; ".join([f"{item.quantity}x {item.product.name} - {item.selected_color or 'N/A'}, Size: {item.selected_size or 'N/A'} (GHS {item.price})" for item in obj.items.all()])
            
            row = [getattr(obj, field) for field in field_names]
            row.append(items_str)
            writer.writerow(row)

        return response
    export_as_csv.short_description = "Export Selected Orders to CSV"
