from django.urls import path
from . import views

urlpatterns = [
    path('years/', views.CourseListView.as_view(), name='course-years-list'),
]
