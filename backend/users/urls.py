from django.urls import path

from .views import UserCreate, LogoutView, AdminLoginView

app_name = 'users'

urlpatterns = [
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    path('register/', UserCreate.as_view(), name='create_user'),
    path('logout/', LogoutView.as_view(), name='logout'),
]