import csv
from django.contrib import admin
from django.http import HttpResponse
from django.utils.html import format_html
from django.shortcuts import redirect
from django.urls import reverse
from .models import Category, NominationSettings, Nomination

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'group_name', 'is_active', 'nomination_count']
    list_filter = ['group_name', 'is_active']
    search_fields = ['name', 'group_name']
    list_editable = ['is_active']
    ordering = ['group_name', 'name']

    def nomination_count(self, obj):
        return obj.nominations.count()
    nomination_count.short_description = "Submissions"


@admin.register(NominationSettings)
class NominationSettingsAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'is_open', 'updated_at']
    list_editable = ['is_open']

    def has_add_permission(self, request):
        return not NominationSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        obj = NominationSettings.get_settings()
        url = reverse('admin:nominations_nominationsettings_change', args=[obj.pk])
        return redirect(url)


@admin.register(Nomination)
class NominationAdmin(admin.ModelAdmin):
    list_display = [
        'photo_thumbnail', 'nominee_name', 'nominee_phone', 'nominee_email',
        'get_category_name', 'get_group_name', 'nominator_name',
        'created_at'
    ]
    list_filter = ['category__group_name', 'category', 'created_at']
    search_fields = ['nominee_name', 'nominee_phone', 'nominee_email', 'nominator_name', 'nominator_email', 'nominator_phone']
    readonly_fields = ['photo_preview', 'nominee_name_normalized', 'created_at']
    actions = ['export_nominations_csv']

    fieldsets = (
        ("Nominee Information", {
            "fields": ("nominee_name", "nominee_phone", "nominee_email", "category", "nominee_photo", "photo_preview")
        }),
        ("Nominator Information", {
            "fields": ("nominator_name", "nominator_phone", "nominator_email")
        }),
        ("Metadata", {
            "fields": ("nominee_name_normalized", "created_at"),
            "classes": ("collapse",)
        }),
    )

    def get_category_name(self, obj):
        return obj.category.name
    get_category_name.short_description = "Award Category"
    get_category_name.admin_order_field = "category__name"

    def get_group_name(self, obj):
        return obj.category.group_name
    get_group_name.short_description = "Group"
    get_group_name.admin_order_field = "category__group_name"

    def photo_thumbnail(self, obj):
        if obj.nominee_photo:
            return format_html(
                '<img src="{}" style="width: 42px; height: 42px; object-fit: cover; border-radius: 50%; border: 2px solid #3b82f6;" />',
                obj.nominee_photo.url
            )
        return format_html('<div style="width: 42px; height: 42px; background: #e5e7eb; border-radius: 50%;"></div>')
    photo_thumbnail.short_description = "Photo"

    def photo_preview(self, obj):
        if obj.nominee_photo:
            url = obj.nominee_photo.url
            return format_html(
                '<div style="margin-top: 5px;">'
                '<a href="{0}" target="_blank" rel="noopener font-semibold"><img src="{0}" style="max-width: 250px; max-height: 250px; object-fit: cover; border-radius: 12px; border: 1px solid #d1d5db;" /></a>'
                '<br/><a href="{0}" target="_blank" download style="margin-top: 8px; display: inline-flex; items-center; gap: 4px; padding: 6px 12px; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 12px;">Download / View Full Photo ↗</a>'
                '</div>',
                url
            )
        return "No photo uploaded"
    photo_preview.short_description = "Photo Preview"

    @admin.action(description="Export selected nominations to CSV")
    def export_nominations_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="nominations_export.csv"'
        writer = csv.writer(response)
        writer.writerow([
            'Nominee Name', 'Nominee Phone', 'Nominee Email', 'Category Group', 'Award Category', 'Photo URL',
            'Nominator Name', 'Nominator Phone', 'Nominator Email', 'Submission Date'
        ])
        for nom in queryset.select_related('category'):
            photo_url = request.build_absolute_uri(nom.nominee_photo.url) if nom.nominee_photo else ''
            writer.writerow([
                nom.nominee_name,
                nom.nominee_phone or '',
                nom.nominee_email or '',
                nom.category.group_name,
                nom.category.name,
                photo_url,
                nom.nominator_name,
                nom.nominator_phone,
                nom.nominator_email,
                nom.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
        return response
