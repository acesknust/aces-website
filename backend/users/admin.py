from django.contrib import admin
from django.contrib.auth.admin import UserAdmin


from .models import CustomUser



class UserAdminConfig(UserAdmin):
    model = CustomUser
    search_fields = ('email', 'username',)
    list_filter = ('email', 'username', 'is_active', 'is_staff')
    ordering = ('-date_joined',)
    list_display = ('email', 'username',
                    'is_active', 'is_staff')
    fieldsets = (
        (None, {'fields': ('email', 'username',)}),
        ('Permissions', {'fields': ('is_staff', 'is_active')}),
        ('Personal', {'fields': ('about',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username',
                       'password1', 'password2', 'is_active', 'is_staff')}
         ),
    )

admin.site.register(CustomUser, UserAdminConfig)