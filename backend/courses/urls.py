from django.urls import path
from . import views

urlpatterns = [
    path('years/', views.CourseListView.as_view(), name='course-years-list'),
    path('resources/<int:pk>/track/', views.TrackDownloadView.as_view(), name='resource-track-download'),
]

