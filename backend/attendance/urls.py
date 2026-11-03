from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AttendanceRecordViewSet, AttendanceSessionViewSet

app_name = 'attendance'

router = DefaultRouter()
router.register(r'sessions', AttendanceSessionViewSet, basename='session')
router.register(r'records', AttendanceRecordViewSet, basename='record')

urlpatterns = [
    path('', include(router.urls)),
]
