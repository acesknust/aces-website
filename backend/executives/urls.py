from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExecutiveViewSet

router = DefaultRouter()
router.register(r'years', ExecutiveViewSet, basename='executive-years')

urlpatterns = [
    path('', include(router.urls)),
]
