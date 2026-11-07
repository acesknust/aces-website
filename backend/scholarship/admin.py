from django.contrib import admin
from .models import Scholarship


@admin.register(Scholarship)
class ScholarshipAdmin(admin.ModelAdmin):
    """
    Admin configuration for the simplified Scholarship model.
    """
    list_display = ['name', 'deadline', 'status', 'last_updated']
    list_filter = ['status', 'last_updated']
    search_fields = ['name', 'description']
    readonly_fields = ['last_updated', 'created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'image', 'link', 'status')
        }),
        ('Details', {
            'fields': ('eligibility', 'deadline'),
        }),
        ('Metadata', {
            'fields': ('last_updated', 'created_at'),
            'classes': ('collapse',)
        }),
    )
