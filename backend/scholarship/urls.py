from .views import ScholarshipList, CreateScholarship, EditScholarship, DeleteScholarship
from django.urls import path

app_name = 'scholarship'

urlpatterns = [
    path('', ScholarshipList.as_view(), name='scholarship-list'),
    path('create/', CreateScholarship.as_view(), name='scholarship-create'),
    path('edit/<int:pk>/', EditScholarship.as_view(), name='scholarship-edit'),
    path('delete/<int:pk>/', DeleteScholarship.as_view(), name='scholarship-delete'),
]