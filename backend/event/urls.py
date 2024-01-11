from .views import EventList, CreateEvent, EditEvent, DeleteEvent, EventDetail
from django.urls import path

app_name = 'event'

urlpatterns = [
    path('', EventList.as_view(), name='event-list'),
    path('<int:pk>/', EventDetail.as_view(), name='event-detail'),
    path('create/', CreateEvent.as_view(), name='event-create'),
    path('edit/<int:pk>/', EditEvent.as_view(), name='event-edit'),
    path('delete/<int:pk>/', DeleteEvent.as_view(), name='event-delete'),
]