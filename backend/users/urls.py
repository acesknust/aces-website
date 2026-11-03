from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    LogoutView, AdminLoginView, StudentLoginView, SubscribeNewsletterView, StudentRegisterView,
    MeView, PerkListView, RoleViewSet, MemberViewSet,
)

app_name = 'users'

router = DefaultRouter()
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'members', MemberViewSet, basename='member')

urlpatterns = [
    path('admin/login/', AdminLoginView.as_view(), name='admin_login'),
    path('login/', StudentLoginView.as_view(), name='student_login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('newsletter/', SubscribeNewsletterView.as_view(), name='newsletter'),
    path('register/', StudentRegisterView.as_view(), name='student_register'),
    path('me/', MeView.as_view(), name='me'),
    path('perks/', PerkListView.as_view(), name='perks'),
    path('', include(router.urls)),
]