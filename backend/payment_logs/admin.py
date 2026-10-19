from django.contrib import admin
from django.utils.html import format_html
from .models import WebhookLog


@admin.register(WebhookLog)
class WebhookLogAdmin(admin.ModelAdmin):
    list_display = ('reference', 'event_type', 'status_badge', 'created_at', 'provider', 'ip_address')
    list_filter = ('status', 'event_type', 'created_at', 'provider')
    search_fields = ('reference', 'processing_error')
    readonly_fields = ('provider', 'event_type', 'reference', 'payload', 'headers',
                       'ip_address', 'created_at', 'status', 'processing_error')
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Event Details', {
            'fields': ('provider', 'event_type', 'reference', 'status')
        }),
        ('Payload Data', {
            'fields': ('payload', 'headers'),
            'classes': ('collapse',)
        }),
        ('Processing Info', {
            'fields': ('created_at', 'ip_address', 'processing_error')
        }),
    )

    def status_badge(self, obj):
        """Show colored status badges in the list view."""
        colors = {
            'received': '#6B7280',   # gray
            'processed': '#059669',  # green
            'failed': '#DC2626',     # red
            'ignored': '#D97706',    # amber
        }
        color = colors.get(obj.status, '#6B7280')
        return format_html(
            '<span style="background:{}; color:white; padding:3px 10px; '
            'border-radius:12px; font-size:11px; font-weight:600;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'

    def has_add_permission(self, request):
        return False  # Logs are created by the webhook, not by humans

    def has_delete_permission(self, request, obj=None):
        return False  # Audit trail must NEVER be deleted

    def has_change_permission(self, request, obj=None):
        return False  # Logs are immutable — no edits allowed
