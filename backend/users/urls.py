from django.urls import path

from .views import UserCreate, LogoutView

app_name = 'users'

urlpatterns = [
    path('register/', UserCreate.as_view(), name='create_user'),
    path('logout/', LogoutView.as_view(), name='logout'),
]