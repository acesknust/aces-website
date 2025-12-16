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
    
    def has_add_permission(self, request, obj=None):
        return False
        
    def has_change_permission(self, request, obj=None):
        return False
        
    def has_delete_permission(self, request, obj=None):
        return False

from django.utils.html import format_html
import csv
from django.http import HttpResponse

class DeliveryStatusFilter(admin.SimpleListFilter):
    title = 'Delivery Status'
    parameter_name = 'delivery_status'

    def lookups(self, request, model_admin):
        return (
            ('delivered', 'Delivered'),
            ('pending', 'Pending Delivery'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'delivered':
            return queryset.filter(delivered_at__isnull=False)
        if self.value() == 'pending':
            return queryset.filter(delivered_at__isnull=True)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', '_customer_info', '_total_amount', '_status_badge', '_completed_status_btn', '_delivery_status_btn', 'created_at']
    list_filter = ['status', DeliveryStatusFilter, 'created_at', 'items__product__name']
    
    # ... (rest of class) ...

    # ... (items_summary method) ...

    def export_production_manifest(self, request, queryset):
        """
        Generates a professional "Line-Item" CSV for suppliers/production.
        Splits orders into individual rows for each product variant (Color/Size).
        """
        import csv
        from django.http import HttpResponse
        from django.utils import timezone

        # Filename with timestamp for batch tracking
        timestamp = timezone.now().strftime("%Y-%m-%d_%H-%M")
        filename = f"ACES_Orders_{timestamp}.csv"
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        writer = csv.writer(response)

        # Professional Headers for Supplier
        headers = [
            'Order Ref',          # ID for tracking
            'Order Date',         # For SLA/Aging
            'Completion Status',  # EXPLICIT STATUS
            'Date Completed',     # Timestamp
            'Delivery Status',    # EXPLICIT STATUS
            'Date Delivered',     # Timestamp
            'Customer Name',      # For Labeling
            'Contact Phone',      # For Delivery Issues
            'Delivery Location',  # For Logistics
            'Product Type',       # Core Item
            'Variant: Color',     # Critical Production Detail
            'Variant: Size',      # Critical Production Detail
            'Quantity',           # How many to make
            'Payment Status',     # Verification
            'Notes/Ref'           # Internal Ref
        ]
        writer.writerow(headers)

        # Iterate Orders -> Items (Denormalization)
        for order in queryset:
            # Format Date
            order_date = order.created_at.strftime("%Y-%m-%d %H:%M")
            
            # Completion Logic
            is_completed = "Completed" if order.completed_at else "Pending"
            completed_date = order.completed_at.strftime("%Y-%m-%d %H:%M") if order.completed_at else ""
            
            # Delivery Logic
            is_delivered = "Delivered" if order.delivered_at else "Pending"
            delivered_date = order.delivered_at.strftime("%Y-%m-%d %H:%M") if order.delivered_at else ""
            
            for item in order.items.all():
                row = [
                    f"#{order.id}",                 # Order Ref
                    order_date,                     # Order Date
                    is_completed,                   # Completion Status
                    completed_date,                 # Date Completed
                    is_delivered,                   # Delivery Status
                    delivered_date,                 # Date Delivered
                    order.full_name,                # Customer Name
                    order.phone,                    # Contact Phone
                    order.address,                  # Delivery Location
                    item.product.name,              # Product Type
                    item.selected_color or "N/A",   # Color
                    item.selected_size or "N/A",    # Size
                    item.quantity,                  # Quantity
                    order.status.upper(),           # Payment Status
                    order.paystack_reference        # Notes/Ref
                ]
                writer.writerow(row)

        return response
    export_production_manifest.short_description = "📥 Export Orders (CSV)"

    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('toggle-complete/<int:order_id>/', self.admin_site.admin_view(self.toggle_complete), name='order-toggle-complete'),
            path('toggle-delivery/<int:order_id>/', self.admin_site.admin_view(self.toggle_delivery), name='order-toggle-delivery'),
        ]
        return custom_urls + urls

    def toggle_complete(self, request, order_id):
        from django.shortcuts import get_object_or_404, redirect
        from django.utils import timezone
        from django.contrib import messages
        
        order = get_object_or_404(Order, pk=order_id)
        if order.completed_at:
            order.completed_at = None
            order.status = 'PAID' if order.status == 'FULFILLED' else order.status # Revert to Paid if it was Fulfilled
            messages.info(request, f"Order #{order.id} marked as Incomplete.")
        else:
            order.completed_at = timezone.now()
            order.status = 'FULFILLED'
            messages.success(request, f"Order #{order.id} marked as Completed.")
        order.save()
        return redirect('admin:shop_order_changelist')

    def toggle_delivery(self, request, order_id):
        from django.shortcuts import get_object_or_404, redirect
        from django.utils import timezone
        from django.contrib import messages
        
        order = get_object_or_404(Order, pk=order_id)
        if order.delivered_at:
            order.delivered_at = None
            messages.info(request, f"Order #{order.id} marked as Not Delivered.")
        else:
            order.delivered_at = timezone.now()
            messages.success(request, f"Order #{order.id} marked as Delivered.")
        order.save()
        return redirect('admin:shop_order_changelist')
    search_fields = ['id', 'full_name', 'email', 'phone', 'paystack_reference']
    date_hierarchy = 'created_at'
    list_per_page = 20
    inlines = [OrderItemInline]
    actions = ["mark_as_fulfilled", "export_production_manifest"]
    
    # Premium Fieldsets Layout
    fieldsets = (
        ("Order Summary", {
            "fields": ("id", "created_at", "completed_at", "_status_badge", "_total_amount")
        }),
        ("Customer Details", {
            "fields": ("full_name", "email", "phone", "address")
        }),
        ("Payment Verification", {
            "fields": ("paystack_reference", "verification_code"),
            "classes": ("collapse",)
        }),
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return True # Changed to True so we can save "completed_at" status via actions, but fields are readonly

    def has_delete_permission(self, request, obj=None):
        return False 

    def get_readonly_fields(self, request, obj=None):
        # Everything is readonly EXCEPT completed_at (maybe? No, let's keep it readonly and use action)
        return [f.name for f in self.model._meta.fields] + ['_status_badge', '_total_amount', '_customer_info']

    def _completed_status_btn(self, obj):
        from django.urls import reverse
        url = reverse('admin:order-toggle-complete', args=[obj.id])
        if obj.completed_at:
            return format_html(
                '<a href="{}" class="button" style="background-color: #059669; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-decoration: none;">✓ Completed</a><br>'
                '<span style="font-size: 10px; color: #6b7280;">{}</span>',
                url,
                obj.completed_at.strftime("%Y-%m-%d")
            )
        return format_html(
            '<a href="{}" class="button" style="background-color: #fca5a5; color: #7f1d1d; padding: 4px 8px; border-radius: 4px; font-size: 11px; text-decoration: none;">Mark Complete</a>',
            url
        )
    _completed_status_btn.short_description = "Completed"
    _completed_status_btn.allow_tags = True

    def _delivery_status_btn(self, obj):
        from django.urls import reverse
        url = reverse('admin:order-toggle-delivery', args=[obj.id])
        if obj.delivered_at:
            return format_html(
                '<a href="{}" class="button" style="background-color: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-decoration: none;">✓ Delivered</a><br>'
                '<span style="font-size: 10px; color: #6b7280;">{}</span>',
                url,
                obj.delivered_at.strftime("%Y-%m-%d")
            )
        return format_html(
            '<a href="{}" class="button" style="background-color: #e5e7eb; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 11px; text-decoration: none;">Mark Delivered</a>',
            url
        )
    _delivery_status_btn.short_description = "Delivery"
    _delivery_status_btn.allow_tags = True

    def mark_as_fulfilled(self, request, queryset):
        from django.utils import timezone
        now = timezone.now()
        updated = queryset.update(status='FULFILLED', completed_at=now)
        self.message_user(request, f"{updated} orders marked as Fulfilled/Completed.")
    mark_as_fulfilled.short_description = "✅ Mark Selected as Fulfilled/Completed"

    def _status_badge(self, obj):
        colors = {
            "PAID": "green",
            "PENDING": "orange",
            "FAILED": "red",
            "FULFILLED": "blue", # Different color logic
        }
        # If it's fulfilled, prioritize that status visual or keep it separate? User asked for column.
        # Let's keep status badge as PAYMENT status primarily, but order model status field is shared.
        # If status is FULFILLED, show Blue.
        color = colors.get(obj.status.upper(), "grey")
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 15px; font-weight: bold; font-size: 12px;">{}</span>',
            color,
            obj.status.upper()
        )
    _status_badge.short_description = "Status"
    _status_badge.admin_order_field = "status"

    def _total_amount(self, obj):
        return format_html('<span style="font-weight: bold; color: #10b981;">GHS {}</span>', obj.total_amount)
    _total_amount.short_description = "Total"
    _total_amount.admin_order_field = "total_amount"

    def _customer_info(self, obj):
        return format_html(
            '<div style="line-height: 1.2;">'
            '<span style="font-weight: bold; display: block;">{}</span>'
            '<span style="color: #6b7280; font-size: 11px;">{}</span>'
            '</div>',
            obj.full_name,
            obj.phone
        )
    _customer_info.short_description = "Customer"
    _customer_info.admin_order_field = "full_name"

    def _items_count(self, obj):
        count = obj.items.count()
        return f"{count} Items"
    _items_count.short_description = "Items"

    def items_summary(self, obj):
        return ", ".join([f"{item.quantity}x {item.product.name}" for item in obj.items.all()])
    items_summary.short_description = "Quick View"

    def export_production_manifest(self, request, queryset):
        """
        Generates a professional "Line-Item" CSV for suppliers/production.
        Splits orders into individual rows for each product variant (Color/Size).
        """
        import csv
        from django.http import HttpResponse
        from django.utils import timezone

        # Filename with timestamp for batch tracking
        timestamp = timezone.now().strftime("%Y-%m-%d_%H-%M")
        filename = f"ACES_Orders_{timestamp}.csv" # Renamed as requested to something simpler but professional
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        writer = csv.writer(response)

        # Professional Headers for Supplier
        headers = [
            'Order Ref',          # ID for tracking
            'Order Date',         # For SLA/Aging
            'Date Completed',     # Fulfillment Date
            'Date Delivered',     # NEW: Delivery Date
            'Customer Name',      # For Labeling
            'Contact Phone',      # For Delivery Issues
            'Delivery Location',  # For Logistics
            'Product Type',       # Core Item
            'Variant: Color',     # Critical Production Detail
            'Variant: Size',      # Critical Production Detail
            'Quantity',           # How many to make
            'Payment Status',     # Verification
            'Notes/Ref'           # Internal Ref
        ]
        writer.writerow(headers)

        # Iterate Orders -> Items (Denormalization)
        for order in queryset:
            # Format Date
            order_date = order.created_at.strftime("%Y-%m-%d %H:%M")
            completed_date = order.completed_at.strftime("%Y-%m-%d %H:%M") if order.completed_at else "Pending"
            delivered_date = order.delivered_at.strftime("%Y-%m-%d %H:%M") if order.delivered_at else "Pending"
            
            for item in order.items.all():
                row = [
                    f"#{order.id}",                 # Order Ref
                    order_date,                     # Order Date
                    completed_date,                 # Date Completed
                    delivered_date,                 # Date Delivered
                    order.full_name,                # Customer Name
                    order.phone,                    # Contact Phone
                    order.address,                  # Delivery Location
                    item.product.name,              # Product Type
                    item.selected_color or "N/A",   # Color
                    item.selected_size or "N/A",    # Size
                    item.quantity,                  # Quantity
                    order.status.upper(),           # Payment Status
                    order.paystack_reference        # Notes/Ref
                ]
                writer.writerow(row)

        return response
    export_production_manifest.short_description = "📥 Export Orders (CSV)"
