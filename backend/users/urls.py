from django.urls import path

from .views import LogoutView, AdminLoginView, SubscribeNewsletterView

app_name = 'users'

urlpatterns = [
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('newsletter/', SubscribeNewsletterView.as_view(), name='newsletter'),
]