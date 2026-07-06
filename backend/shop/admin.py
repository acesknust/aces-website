from django.contrib import admin
from .models import Category, Product, Order, OrderItem, ProductImage, Coupon, ProductSize, SiteSettings

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    extra = 1 # Show one empty row by default to encourage adding
    fields = ['name', 'display_order', 'is_available']
    ordering = ['display_order', 'name']
    verbose_name = "Specific Size"
    verbose_name_plural = "Specific Sizes (Leave empty for default S-XXL)"
    # classes = ['collapse'] # Removed to make it immediately visible


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'is_active', 'has_sizes']
    list_filter = ['category', 'is_active', 'has_sizes']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, ProductSizeInline]
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'category', 'description', 'price', 'stock', 'is_active')
        }),
        ('Images', {
            'fields': ('image', 'image_color'),
        }),
        ('Size Options', {
            'fields': ('has_sizes',),
            'description': 'Check "Has sizes" to enable size selection. <strong>Note:</strong> If you keep "Has sizes" checked but do not add any specific "Size Variants" below, the standard sizes (S, M, L, XL, XXL) will be used automatically.',
        }),
    )

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
    list_display = ['id', '_customer_info', '_total_amount', '_status_badge', 'payment_method', '_completed_status_btn', '_delivery_status_btn', 'created_at']
    list_filter = ['status', 'payment_method', DeliveryStatusFilter, 'created_at', 'items__product__name']
    
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
            path('verify-payment/<int:order_id>/', self.admin_site.admin_view(self.admin_verify_payment), name='order-verify-payment'),
        ]
        return custom_urls + urls

    def changelist_view(self, request, extra_context=None):
        # LAZY CLEANUP: Auto-fail stale pending orders when admin checks the list
        from django.utils import timezone
        from datetime import timedelta
        
        # Threshold: 48 hours
        threshold = timezone.now() - timedelta(hours=48)
        Order.objects.filter(status='PENDING', created_at__lt=threshold).update(status='FAILED')
        
        return super().changelist_view(request, extra_context=extra_context)

    def toggle_complete(self, request, order_id):
        from django.shortcuts import get_object_or_404, redirect
        from django.utils import timezone
        from django.contrib import messages
        
        order = get_object_or_404(Order, pk=order_id)
        
        # Guard: Cannot complete unpaid orders
        if not order.completed_at and order.status not in ['PAID', 'FULFILLED']:
            messages.error(request, f"⚠️ Cannot complete: Order #{order.id} is {order.status}. Payment must be verified (PAID) before completing.")
            return redirect('admin:shop_order_changelist')
        
        # Guard: Cannot un-complete a delivered order
        if order.completed_at and order.delivered_at:
            messages.error(request, f"🚫 Cannot revert: Order #{order.id} has already been DELIVERED. Un-deliver it first if needed.")
            return redirect('admin:shop_order_changelist')

        if order.completed_at:
            order.completed_at = None
            # Only revert to PAID if it was FULFILLED (don't touch if it was somehow else)
            if order.status == 'FULFILLED':
                order.status = 'PAID'
            messages.info(request, f"Order #{order.id} marked as Incomplete (Status reverted to PAID).")
        else:
            order.completed_at = timezone.now()
            order.status = 'FULFILLED'
            messages.success(request, f"Order #{order.id} marked as Completed (FULFILLED).")
        
        order.save()
        return redirect('admin:shop_order_changelist')

    @admin.action(description="❌ Mark selected orders as Failed (Cancel)")
    def mark_as_failed(self, request, queryset):
        from django.contrib import messages
        
        # Separate orders by whether they can be cancelled
        # FULFILLED orders with delivered_at cannot be cancelled
        # FULFILLED orders without delivered_at can be cancelled (reverts to unfulfilled state)
        delivered_orders = queryset.filter(delivered_at__isnull=False)
        cancellable_orders = queryset.filter(delivered_at__isnull=True).exclude(status='FAILED')
        already_failed = queryset.filter(status='FAILED')
        
        delivered_count = delivered_orders.count()
        already_failed_count = already_failed.count()
        
        # Only cancel non-delivered orders
        if cancellable_orders.exists():
            # Clear completion timestamps when cancelling
            updated = cancellable_orders.update(status='FAILED', completed_at=None)
            messages.success(request, f"❌ {updated} order(s) marked as FAILED/Cancelled.")
        else:
            updated = 0
        
        # Warn about delivered orders that cannot be cancelled
        if delivered_count > 0:
            delivered_ids = list(delivered_orders.values_list('id', flat=True)[:5])
            delivered_str = ", ".join([f"#{id}" for id in delivered_ids])
            if delivered_count > 5:
                delivered_str += f"... and {delivered_count - 5} more"
            messages.error(
                request, 
                f"🚫 {delivered_count} order(s) cannot be cancelled because they are DELIVERED: {delivered_str}"
            )
        
        # Info about already failed orders
        if already_failed_count > 0:
            messages.info(request, f"ℹ️ {already_failed_count} order(s) were already FAILED.")

    def toggle_delivery(self, request, order_id):
        from django.shortcuts import get_object_or_404, redirect
        from django.utils import timezone
        from django.contrib import messages
        
        order = get_object_or_404(Order, pk=order_id)
        
        # Guard: Cannot deliver items that are not completed (Fulfilled)
        if not order.delivered_at and not order.completed_at:
             messages.error(request, f"⚠️ Delivery failed: Order #{order.id} is not Completed. Please mark as Completed before delivering.")
             return redirect('admin:shop_order_changelist')

        if order.delivered_at:
            order.delivered_at = None
            messages.info(request, f"Order #{order.id} marked as Not Delivered.")
        else:
            order.delivered_at = timezone.now()
            messages.success(request, f"Order #{order.id} marked as Delivered.")
        order.save()
        return redirect('admin:shop_order_changelist')

    def admin_verify_payment(self, request, order_id):
        from django.shortcuts import get_object_or_404, redirect
        from django.contrib import messages
        from django.db import transaction
        import uuid
        import threading
        from .utils import send_customer_email
        from .models import Product

        order = get_object_or_404(Order, pk=order_id)

        if order.status != 'PENDING':
            messages.error(request, f"⚠️ Order #{order.id} is already processed (Status: {order.status}).")
            return redirect('admin:shop_order_changelist')

        try:
            with transaction.atomic():
                locked_order = Order.objects.select_for_update().get(id=order.id)
                if locked_order.status != 'PENDING':
                    messages.error(request, f"⚠️ Order #{locked_order.id} status changed during processing.")
                    return redirect('admin:shop_order_changelist')

                # Decrement stock
                for item in locked_order.items.select_related('product').all():
                    product = Product.objects.select_for_update().get(id=item.product.id)
                    if product.stock >= item.quantity:
                        product.stock -= item.quantity
                    else:
                        product.stock = 0
                    product.save()

                locked_order.status = 'PAID'
                locked_order.verification_code = str(uuid.uuid4())
                locked_order.save()

                # Send email
                def run_safe_email(email_func, ord_obj):
                    try:
                        email_func(ord_obj)
                    except Exception as email_err:
                        import logging
                        logging.getLogger(__name__).error(f"Failed to send email for order #{ord_obj.id}: {email_err}")

                threading.Thread(target=run_safe_email, args=(send_customer_email, locked_order), daemon=True).start()

                messages.success(request, f"💰 Order #{locked_order.id} marked as PAID. Stock updated and confirmation email sent!")
        except Exception as e:
            messages.error(request, f"Error verifying payment: {str(e)}")

        return redirect('admin:shop_order_changelist')

    @admin.action(description="💰 Verify Payment (Mark as PAID)")
    def mark_as_paid(self, request, queryset):
        from django.contrib import messages
        from django.db import transaction
        import uuid
        import threading
        from .utils import send_customer_email
        from .models import Product
        
        pending_orders = queryset.filter(status='PENDING')
        updated_count = 0
        
        for order in pending_orders:
            try:
                with transaction.atomic():
                    locked_order = Order.objects.select_for_update().get(id=order.id)
                    if locked_order.status != 'PENDING':
                        continue
                        
                    # Decrement stock
                    for item in locked_order.items.select_related('product').all():
                        product = Product.objects.select_for_update().get(id=item.product.id)
                        if product.stock >= item.quantity:
                            product.stock -= item.quantity
                        else:
                            product.stock = 0
                        product.save()
                    
                    locked_order.status = 'PAID'
                    locked_order.verification_code = str(uuid.uuid4())
                    locked_order.save()
                    
                    # Send email
                    def run_safe_email(email_func, ord_obj):
                        try:
                            email_func(ord_obj)
                        except Exception as email_err:
                            import logging
                            logging.getLogger(__name__).error(f"Failed to send email for order #{ord_obj.id}: {email_err}")

                    threading.Thread(target=run_safe_email, args=(send_customer_email, locked_order), daemon=True).start()
                    updated_count += 1
            except Exception as e:
                messages.error(request, f"Error verifying order #{order.id}: {str(e)}")
                
        if updated_count > 0:
            messages.success(request, f"💰 Successfully verified payment and marked {updated_count} order(s) as PAID.")
        else:
            messages.warning(request, "No pending orders were marked as paid.")

    search_fields = ['id', 'full_name', 'email', 'phone', 'paystack_reference', 'momo_sender_name']
    date_hierarchy = 'created_at'
    list_per_page = 20
    inlines = [OrderItemInline]
    actions = ["mark_as_paid", "mark_as_fulfilled", "export_production_manifest", "mark_as_failed"]
    
    # Premium Fieldsets Layout
    fieldsets = (
        ("Order Summary", {
            "fields": ("id", "created_at", "completed_at", "_status_badge", "_total_amount")
        }),
        ("Customer Details", {
            "fields": ("full_name", "email", "phone", "address")
        }),
        ("Payment Details", {
            "fields": ("payment_method", "momo_sender_name", "momo_amount_paid", "_momo_receipt_preview", "paystack_reference", "verification_code"),
        }),
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return True # Changed to True so we can save "completed_at" status via actions, but fields are readonly

    def has_delete_permission(self, request, obj=None):
        return True  # Enabled for cleaning up test orders

    def get_readonly_fields(self, request, obj=None):
        # Everything is readonly EXCEPT completed_at (maybe? No, let's keep it readonly and use action)
        return [f.name for f in self.model._meta.fields] + ['_status_badge', '_total_amount', '_customer_info', '_momo_receipt_preview']

    def _momo_receipt_preview(self, obj):
        if obj.momo_receipt:
            return format_html(
                '<a href="{0}" target="_blank">'
                '<img src="{0}" style="max-height: 250px; max-width: 100%; border-radius: 8px; border: 1px solid #e5e7eb; padding: 4px; background: #fff;" />'
                '<br><span style="font-size: 11px; color: #2563eb; text-decoration: underline; display: inline-block; margin-top: 6px; font-weight: bold;">🔍 Click to view full size</span>'
                '</a>',
                obj.momo_receipt.url
            )
        return "No receipt uploaded"
    _momo_receipt_preview.short_description = "MoMo Receipt Screenshot"

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
        from django.contrib import messages
        
        now = timezone.now()
        
        # Separate orders into paid and unpaid
        paid_orders = queryset.filter(status__in=['PAID', 'FULFILLED'])
        unpaid_orders = queryset.exclude(status__in=['PAID', 'FULFILLED'])
        
        unpaid_count = unpaid_orders.count()
        
        # Only update PAID orders
        if paid_orders.exists():
            updated = paid_orders.update(status='FULFILLED', completed_at=now)
            messages.success(request, f"✅ {updated} order(s) marked as Fulfilled/Completed.")
        else:
            updated = 0
        
        # Warn about unpaid orders that were skipped
        if unpaid_count > 0:
            # Get the IDs of skipped orders for clarity
            skipped_ids = list(unpaid_orders.values_list('id', flat=True)[:10])  # Limit to first 10
            skipped_str = ", ".join([f"#{id}" for id in skipped_ids])
            if unpaid_count > 10:
                skipped_str += f"... and {unpaid_count - 10} more"
            messages.warning(
                request, 
                f"⚠️ {unpaid_count} order(s) were SKIPPED because they are not PAID: {skipped_str}"
            )
    mark_as_fulfilled.short_description = "✅ Mark Selected as Fulfilled/Completed"

    def _status_badge(self, obj):
        if obj.status == 'PENDING':
            from django.urls import reverse
            url = reverse('admin:order-verify-payment', args=[obj.id])
            return format_html(
                '<a href="{}" class="button" style="background-color: #d97706; color: white; padding: 4px 10px; border-radius: 4px; font-weight: bold; text-decoration: none; font-size: 11px; display: inline-block;">Verify Payment</a>',
                url
            )
            
        colors = {
            "PAID": "#059669",
            "FAILED": "#dc2626",
            "FULFILLED": "#2563eb",
        }
        color = colors.get(obj.status.upper(), "grey")
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 12px; border-radius: 15px; font-weight: bold; font-size: 11px;">{}</span>',
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


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    """
    Admin for managing Committee Head discount coupons.
    """
    list_display = [
        'code', 
        'owner_name', 
        'owner_role', 
        '_discount_display', 
        '_usage_display', 
        '_status_badge',
        'is_active',  # Added for list_editable to work
        'expires_at',
        'created_at'
    ]
    list_filter = ['is_active', 'owner_role', 'discount_percent', 'created_at']
    search_fields = ['code', 'owner_name', 'owner_role']
    ordering = ['-created_at']
    list_per_page = 20
    
    # Make is_active editable directly in list view
    list_editable = ['is_active']
    
    fieldsets = (
        ("Coupon Details", {
            "fields": ("code", "owner_name", "owner_role", "discount_percent")
        }),
        ("Usage Limits", {
            "fields": ("max_uses", "times_used", "expires_at", "is_active"),
            "description": "Control how many times this coupon can be used and when it expires."
        }),
    )
    
    readonly_fields = ['times_used', 'created_at']
    
    def _discount_display(self, obj):
        return f"{obj.discount_percent}% OFF"
    _discount_display.short_description = "Discount"
    
    def _usage_display(self, obj):
        remaining = obj.get_remaining_uses()
        return format_html(
            '<span style="font-weight: bold;">{}</span> / {} used',
            obj.times_used,
            obj.max_uses
        )
    _usage_display.short_description = "Usage"
    
    def _status_badge(self, obj):
        if obj.is_valid():
            return format_html(
                '<span style="background-color: #10b981; color: white; padding: 3px 10px; border-radius: 15px; font-size: 11px;">✓ Active</span>'
            )
        elif not obj.is_active:
            return format_html(
                '<span style="background-color: #6b7280; color: white; padding: 3px 10px; border-radius: 15px; font-size: 11px;">Disabled</span>'
            )
        elif obj.times_used >= obj.max_uses:
            return format_html(
                '<span style="background-color: #f59e0b; color: white; padding: 3px 10px; border-radius: 15px; font-size: 11px;">Max Used</span>'
            )
        else:
            return format_html(
                '<span style="background-color: #ef4444; color: white; padding: 3px 10px; border-radius: 15px; font-size: 11px;">Expired</span>'
            )
    _status_badge.short_description = "Status"
    
    def get_urls(self):
        from django.urls import path
        urls = super().get_urls()
        custom_urls = [
            path('generate-code/', self.admin_site.admin_view(self.generate_code_view), name='coupon-generate-code'),
        ]
        return custom_urls + urls
    
    def generate_code_view(self, request):
        """AJAX endpoint to generate a unique code."""
        from django.http import JsonResponse
        owner_name = request.GET.get('owner_name', '')
        owner_role = request.GET.get('owner_role', '')
        
        # Generate unique code
        code = Coupon.generate_unique_code(owner_name, owner_role)
        
        # Ensure uniqueness
        attempts = 0
        while Coupon.objects.filter(code=code).exists() and attempts < 10:
            code = Coupon.generate_unique_code(owner_name, owner_role)
            attempts += 1
        
        return JsonResponse({'code': code})
    
    def add_view(self, request, form_url='', extra_context=None):
        """Add JavaScript for auto-generating codes."""
        extra_context = extra_context or {}
        extra_context['show_generate_button'] = True
        return super().add_view(request, form_url, extra_context)
    
    class Media:
        js = ('admin/js/coupon_admin.js',)  # We'll create this file


# =============================================================================
# Site Settings — Kill Switch Admin
# =============================================================================

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    """
    Singleton editor for the Shop Kill Switch.
    - Changelist auto-redirects to the edit form (no row list needed).
    - Admins cannot add a second row or delete the one that exists.
    """
    fieldsets = (
        ("🛒 Shop Availability", {
            "fields": ("is_shop_open", "closed_message"),
            "description": (
                "<strong style='color:#dc2626;'>WARNING:</strong> Unchecking "
                "\"Shop is Open\" will immediately close the shop for ALL visitors "
                "and block new orders. Re-check to reopen."
            ),
        }),
        ("Metadata", {
            "fields": ("updated_at",),
            "classes": ("collapse",),
        }),
    )
    readonly_fields = ("updated_at",)

    def has_add_permission(self, request):
        # Block adding a second SiteSettings row
        try:
            return not SiteSettings.objects.exists()
        except Exception:
            # If migration hasn't run, exists() throws ProgrammingError
            # Return False so the admin doesn't crash globally
            return False

    def has_delete_permission(self, request, obj=None):
        # Never allow deletion of the singleton
        return False

    def changelist_view(self, request, extra_context=None):
        """Redirect the changelist straight to the single settings object editor."""
        from django.shortcuts import redirect
        obj = SiteSettings.get()
        return redirect(f"../{ obj.pk }/change/")
