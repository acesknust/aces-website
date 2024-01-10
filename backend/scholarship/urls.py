from .views import ScholarshipList, CreateScholarship, EditScholarship, DeleteScholarship, ScholarshipDetail
from django.urls import path

app_name = 'scholarship'

urlpatterns = [
    path('', ScholarshipList.as_view(), name='scholarship-list'),
    path('<int:pk>/', ScholarshipDetail.as_view(), name='scholarship-detail'),
    path('create/', CreateScholarship.as_view(), name='scholarship-create'),
    path('edit/<int:pk>/', EditScholarship.as_view(), name='scholarship-edit'),
    path('delete/<int:pk>/', DeleteScholarship.as_view(), name='scholarship-delete'),
]