from django.urls import path
from .views import StaffMemberListView

urlpatterns = [
    path('', StaffMemberListView.as_view(), name='staff-list'),
]
