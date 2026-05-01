from django.urls import path

from .views import LogoutView, AdminLoginView

app_name = 'users'

urlpatterns = [
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    path('logout/', LogoutView.as_view(), name='logout'),
]