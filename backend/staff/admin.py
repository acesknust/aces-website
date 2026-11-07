from django.contrib import admin
from django.utils.html import format_html
from .models import StaffMember


@admin.register(StaffMember)
class StaffMemberAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'image_preview', 'display_order', 'is_active']
    list_filter = ['is_active', 'position']
    list_editable = ['display_order', 'is_active']
    search_fields = ['name', 'position']
    ordering = ['display_order', 'name']

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;" />',
                obj.image.url
            )
        return "No Image"
    image_preview.short_description = "Photo"
