from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'status')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')

