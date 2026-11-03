from django.contrib import admin
from .models import AttendanceRecord, AttendanceSession


class AttendanceRecordInline(admin.TabularInline):
    model = AttendanceRecord
    extra = 0
    readonly_fields = ('marked_by', 'marked_at')


@admin.register(AttendanceSession)
class AttendanceSessionAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'event', 'created_by')
    search_fields = ('title',)
    inlines = [AttendanceRecordInline]
