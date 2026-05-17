from django.contrib import admin
from django.utils.html import format_html
from .models import AcademicYear, Semester, Course, CourseResource


# =============================================================================
# Course Resource Inline — shown inside the Course edit page
# =============================================================================

class CourseResourceInline(admin.TabularInline):
    model = CourseResource
    extra = 1
    fields = [
        'title', 'resource_type', 'file', 'external_url',
        'file_size_display', 'download_count', 'is_active', 'sort_order'
    ]
    readonly_fields = ['file_size_display', 'download_count']
    ordering = ['resource_type', 'sort_order']

    def file_size_display(self, obj):
        if not obj.file_size:
            return "—"
        mb = obj.file_size / (1024 * 1024)
        if mb >= 1:
            return f"{mb:.1f} MB"
        kb = obj.file_size / 1024
        return f"{kb:.0f} KB"
    file_size_display.short_description = "Size"


# =============================================================================
# Course Inline — shown inside the Semester edit page
# =============================================================================

class CourseInline(admin.TabularInline):
    model = Course
    extra = 1
    fields = ['name', 'code', 'credits', 'resource_url', 'sort_order']
    ordering = ['sort_order']


# =============================================================================
# Semester Inline — shown inside the Academic Year edit page
# =============================================================================

class SemesterInline(admin.TabularInline):
    model = Semester
    extra = 0
    show_change_link = True
    fields = ['semester_number', 'semester_name']
    ordering = ['semester_number']


# =============================================================================
# Academic Year Admin
# =============================================================================

@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ['year', 'year_name', 'is_active', 'total_semesters']
    list_filter = ['is_active']
    inlines = [SemesterInline]
    
    def total_semesters(self, obj):
        return obj.semesters.count()


# =============================================================================
# Semester Admin
# =============================================================================

@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'academic_year', 'semester_number', 'total_courses']
    list_filter = ['academic_year']
    inlines = [CourseInline]
    
    def total_courses(self, obj):
        return obj.courses.count()


# =============================================================================
# Course Admin — with CourseResource inline for file uploads
# =============================================================================

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'code', 'semester', 'credits',
        'resource_count_display', 'has_legacy_url'
    ]
    list_filter = ['semester__academic_year', 'semester']
    search_fields = ['name', 'code', 'description']
    inlines = [CourseResourceInline]

    fieldsets = (
        (None, {
            'fields': ('semester', 'name', 'code', 'credits', 'description', 'sort_order')
        }),
        ('Legacy Resource Link', {
            'fields': ('resource_url',),
            'classes': ('collapse',),
            'description': (
                'This is the old single-URL field. For new resources, use the '
                '"Course Resources" section below to upload files or add links.'
            ),
        }),
    )

    def resource_count_display(self, obj):
        count = obj.resources.count()
        if count == 0:
            return format_html(
                '<span style="color: #ef4444; font-weight: 600;">0 resources</span>'
            )
        return format_html(
            '<span style="color: #10b981; font-weight: 600;">{} resource{}</span>',
            count, 's' if count != 1 else ''
        )
    resource_count_display.short_description = "Resources"

    def has_legacy_url(self, obj):
        return bool(obj.resource_url)
    has_legacy_url.boolean = True
    has_legacy_url.short_description = "Legacy URL"


# =============================================================================
# CourseResource Admin — standalone view for bulk management
# =============================================================================

@admin.register(CourseResource)
class CourseResourceAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'course_display', 'resource_type',
        'file_type_badge', 'file_size_display',
        'download_count', 'is_active', 'created_at'
    ]
    list_filter = ['resource_type', 'is_active', 'course__semester__academic_year']
    search_fields = ['title', 'course__name', 'course__code']
    ordering = ['-created_at']
    list_per_page = 30

    def course_display(self, obj):
        code = obj.course.code or ''
        return f"{code} {obj.course.name}".strip()
    course_display.short_description = "Course"

    def file_type_badge(self, obj):
        ext = obj.file_extension or '—'
        colors = {
            'pdf': '#ef4444', 'zip': '#8b5cf6', 'rar': '#8b5cf6',
            'pptx': '#f97316', 'ppt': '#f97316',
            'docx': '#3b82f6', 'doc': '#3b82f6',
        }
        color = colors.get(ext, '#6b7280')
        source = "📁 File" if obj.file else "🔗 Link"
        return format_html(
            '<span style="background: {}; color: white; padding: 2px 8px; '
            'border-radius: 8px; font-size: 11px; font-weight: 600;">.{}</span> '
            '<span style="color: #9ca3af; font-size: 11px;">{}</span>',
            color, ext, source
        )
    file_type_badge.short_description = "Type"

    def file_size_display(self, obj):
        if not obj.file_size:
            return "—"
        mb = obj.file_size / (1024 * 1024)
        if mb >= 1:
            return f"{mb:.1f} MB"
        kb = obj.file_size / 1024
        return f"{kb:.0f} KB"
    file_size_display.short_description = "Size"

