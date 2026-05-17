from django.urls import path

from .views import LogoutView, AdminLoginView, StudentLoginView, SubscribeNewsletterView, StudentRegisterView

app_name = 'users'

urlpatterns = [
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    path('login/', StudentLoginView.as_view(), name='student_login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('newsletter/', SubscribeNewsletterView.as_view(), name='newsletter'),
    path('register/', StudentRegisterView.as_view(), name='student_register'),
]