from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Case, When, Value, IntegerField
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import AcademicYear, Executive, SocialLink

class ExecutiveInline(admin.TabularInline):
    model = Executive
    extra = 0
    # Removed non-existent fields (linkedin_url, etc)
    fields = ['image_preview', 'name', 'position', 'edit_link'] 
    readonly_fields = ['image_preview', 'edit_link']
    ordering = ['position'] # Fallback, but we want custom logic

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Use the same logic as the main admin to order by rank
        return qs.annotate(
            rank=Case(
                When(position='president', then=Value(1)),
                When(position='vice_president', then=Value(2)),
                When(position='general_secretary', then=Value(3)),
                When(position='financial_secretary', then=Value(4)),
                When(position='organizing_secretary', then=Value(5)),
                When(position='pro', then=Value(6)),
                When(position='womens_commissioner', then=Value(7)),
                default=Value(99),
                output_field=IntegerField(),
            )
        ).order_by('rank')

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%;" />', obj.image.url)
        return "No Image"
    image_preview.short_description = "Preview"

    def edit_link(self, obj):
        if obj.pk:
            url = reverse('admin:executives_executive_change', args=[obj.pk])
            return mark_safe(f'<a href="{url}" class="button" style="padding: 5px 10px;">Edit Full Profile</a>')
        return "-"
    edit_link.short_description = "Actions"

@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_current', 'display_exec_count', 'banner_preview', 'group_photo_preview', 'created_at']
    list_filter = ['is_current']
    search_fields = ['name', 'description']
    inlines = [ExecutiveInline]
    
    # Organize the layout with CLEAR labels for non-developers
    fieldsets = (
        ("📅 Year Configuration", {
            "fields": ("name", "is_current"),
            "description": "Define the academic year (e.g. 2024-2025) and set if it's the active one."
        }),
        ("🖼️ ABOUT PAGE - Group Photo", {
            "fields": ("group_photo", "group_photo_preview"),
            "description": "⬆️ Upload the group photo that appears at the TOP of the ABOUT page (/about)."
        }),
        ("🎯 EXECUTIVES PAGE - Hero Banner", {
            "fields": ("hero_banner", "banner_preview"),
            "description": "⬆️ Upload the hero banner for the EXECUTIVES page (/executives)."
        }),
        ("📝 Welcome Message", {
            "fields": ("description", "show_description"),
            "description": "Optional welcome text shown below the executives on the /executives page.",
            "classes": ("collapse",),
        }),
    )
    readonly_fields = ['banner_preview', 'group_photo_preview']

    def display_exec_count(self, obj):
        count = obj.executives.count()
        return f"{count} Executives"
    display_exec_count.short_description = "Team Size"

    def banner_preview(self, obj):
        if obj.hero_banner:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 200px; object-fit: cover; border-radius: 8px;" />', obj.hero_banner.url)
        return "No Banner"
    banner_preview.short_description = "Executives Page Preview"

    def group_photo_preview(self, obj):
        if obj.group_photo:
            return format_html('<img src="{}" style="max-height: 100px; max-width: 200px; object-fit: cover; border-radius: 8px;" />', obj.group_photo.url)
        return "No Group Photo"
    group_photo_preview.short_description = "About Page Preview"

class SocialLinkInline(admin.TabularInline):
    model = SocialLink
    extra = 1
    fields = ['platform', 'url', 'is_visible']

@admin.register(Executive)
class ExecutiveAdmin(admin.ModelAdmin):
    list_display = ['profile_preview', 'name', 'position_badge', 'academic_year', 'social_count']
    list_filter = ['academic_year', 'position']
    search_fields = ['name', 'position']
    list_display_links = ['name', 'profile_preview']
    inlines = [SocialLinkInline]
    
    fieldsets = (
        ("Identity", {
            "fields": (("name", "academic_year"), "position", "image")
        }),
    )

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        # Custom sorting logic: Year (Newest first) -> Position Rank (President #1)
        return qs.annotate(
            rank=Case(
                When(position='president', then=Value(1)),
                When(position='vice_president', then=Value(2)),
                When(position='general_secretary', then=Value(3)),
                When(position='financial_secretary', then=Value(4)),
                When(position='organizing_secretary', then=Value(5)),
                When(position='pro', then=Value(6)),
                When(position='womens_commissioner', then=Value(7)),
                default=Value(99),
                output_field=IntegerField(),
            )
        ).order_by('-academic_year__name', 'rank')

    def position_badge(self, obj):
        # Visual cues for positions
        colors = {
            'president': '#1e3a8a', # Blue-900
            'vice_president': '#1d4ed8', # Blue-700
            'general_secretary': '#0f766e', # Emerald-700
            'financial_secretary': '#b45309', # Amber-700
        }
        color = colors.get(obj.position, '#4b5563') # Gray-600 default
        return format_html(
            '<span style="background-color: {}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">{}</span>',
            color,
            obj.get_position_display().upper()
        )
    position_badge.short_description = "Position"

    def profile_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%; border: 2px solid #e5e7eb;" />', obj.image.url)
        return format_html('<div style="width: 40px; height: 40px; background-color: #f3f4f6; border-radius: 50%; display: flex; items-center; justify-center;">?</div>')
    profile_preview.short_description = "Photo"

    def social_count(self, obj):
        return obj.social_links.count()
    social_count.short_description = "Socials"
