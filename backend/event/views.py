from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from azure.storage.blob import BlobServiceClient
from django.conf import settings
import uuid
from uuid import uuid4

from .models import Event
from .serializers import EventSerializer

class EventList(generics.ListAPIView):
    """List all events"""
    permission_classes = [permissions.AllowAny]
    queryset = Event.objects.order_by('-id')
    serializer_class = EventSerializer

class EventDetail(generics.RetrieveAPIView):
    """Retrieve an event"""
    permission_classes = [permissions.AllowAny]
    queryset = Event.objects.all()
    serializer_class = EventSerializer

def upload_to_azure_storage(file, container_name, blob_name):
    blob_service_client = BlobServiceClient.from_connection_string(settings.AZURE_CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(container_name)
    blob_client = container_client.get_blob_client(blob_name)
    blob_client.upload_blob(file, overwrite=True)
    return blob_client.url

class CreateEvent(generics.CreateAPIView):
    """Create a new event only for admin users"""
    permission_classes = [permissions.IsAdminUser]
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get the uploaded image
        image = request.data['image']
        image.name = f"{uuid4().hex}.{image.name.split('.')[-1]}"

        # Upload the image to Azure Storage
        upload_to_azure_storage(image.file, settings.AZURE_STORAGE_CONTAINER_NAME, f"images/events/{image.name}")

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)

class EditEvent(generics.RetrieveUpdateAPIView):
    """Edit an event"""
    permission_classes = [permissions.IsAdminUser]
    queryset = Event.objects.all()
    serializer_class = EventSerializer

    def update(self, request, *args, **kwargs):

        # Get the uploaded image
        image = request.data['image']
        image.name = f"{uuid4().hex}.{image.name.split('.')[-1]}"

        # Upload the image to Azure Storage
        upload_to_azure_storage(image.file, settings.AZURE_STORAGE_CONTAINER_NAME, f"images/events/{image.name}")

        return super().update(request, *args, **kwargs)
    
class DeleteEvent(generics.DestroyAPIView):
    """Delete an event"""
    permission_classes = [permissions.IsAdminUser]
    queryset = Event.objects.all()
    serializer_class = EventSerializer