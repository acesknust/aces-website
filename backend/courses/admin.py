from django.contrib import admin
from .models import AcademicYear, Semester, Course

class CourseInline(admin.TabularInline):
    model = Course
    extra = 1
    fields = ['name', 'code', 'credits', 'resource_url', 'sort_order']
    ordering = ['sort_order']

class SemesterInline(admin.TabularInline):
    model = Semester
    extra = 0
    show_change_link = True
    fields = ['semester_number', 'semester_name']
    ordering = ['semester_number']

@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ['year', 'year_name', 'is_active', 'total_semesters']
    list_filter = ['is_active']
    inlines = [SemesterInline]
    
    def total_semesters(self, obj):
        return obj.semesters.count()

@admin.register(Semester)
class SemesterAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'academic_year', 'semester_number', 'total_courses']
    list_filter = ['academic_year']
    inlines = [CourseInline]
    
    def total_courses(self, obj):
        return obj.courses.count()

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'semester', 'credits', 'has_resource']
    list_filter = ['semester__academic_year', 'semester']
    search_fields = ['name', 'code', 'description']
    
    def has_resource(self, obj):
        return bool(obj.resource_url)
    has_resource.boolean = True
