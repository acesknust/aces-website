"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic.base import TemplateView
# from rest_framework.documentation import include_docs_urls
# from rest_framework.schemas import get_schema_view
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.views.static import serve

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), 
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', TemplateView.as_view(template_name='home.html')),
    path('admin/', admin.site.urls),
    path('api/events/', include('event.urls', namespace='event')),
    path('api/scholarships/', include('scholarship.urls', namespace='scholarship')),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/user/', include('users.urls', namespace='users')),
    path('api/shop/', include('shop.urls')),
    path('api/executives/', include('executives.urls')), # Executives API
    # path('docs/', include_docs_urls(title='ACES WEBSITE API')),
    # path('schema/', get_schema_view(
    #     title="ACES WEBSITE API",
    #     description="API for all things ...",
    #     version="1.0.0"
    # ), name='openapi-schema'),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
