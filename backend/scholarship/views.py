from django.shortcuts import render
from rest_framework import generics, permissions
# from azure.storage.blob import BlobServiceClient
from django.conf import settings
from rest_framework.response import Response
from uuid import uuid4

from .models import Scholarship
from .serializers import ScholarshipSerializer

class ScholarshipList(generics.ListAPIView):
    """List all scholarships"""
    permission_classes = [permissions.AllowAny]
    queryset = Scholarship.objects.order_by('-id')
    serializer_class = ScholarshipSerializer

class ScholarshipDetail(generics.RetrieveAPIView):
    """Retrieve a scholarship"""
    permission_classes = [permissions.AllowAny]
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer

class CreateScholarship(generics.CreateAPIView):
    """Create a new scholarship only for admin users"""
    permission_classes = [permissions.IsAdminUser]
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Get the uploaded image
        image = request.data['image']
        image.name = f"{uuid4().hex}.{image.name.split('.')[-1]}"

        # Upload the image to Azure Storage
        upload_to_azure_storage(image.file, settings.AZURE_STORAGE_CONTAINER_NAME, f"images/scholarships/{image.name}")

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)

def upload_to_azure_storage(file, container_name, blob_name):
    pass
    # blob_service_client = BlobServiceClient.from_connection_string(settings.AZURE_STORAGE_CONNECTION_STRING)
    # container_client = blob_service_client.get_container_client(container_name)
    # blob_client = container_client.get_blob_client(blob_name)

    # blob_client.upload_blob(file)

class EditScholarship(generics.RetrieveUpdateAPIView):
    """Edit a scholarship"""
    permission_classes = [permissions.IsAdminUser]
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer

    def update(self, request, *args, **kwargs):

        # Get the uploaded image
        image = request.data['image']
        image.name = f"{uuid4().hex}.{image.name.split('.')[-1]}"

        # Upload the image to Azure Storage
        upload_to_azure_storage(image.file, settings.AZURE_STORAGE_CONTAINER_NAME, f"images/scholarships/{image.name}")

        return super().update(request, *args, **kwargs)



class DeleteScholarship(generics.RetrieveDestroyAPIView):
    """Delete a scholarship"""
    permission_classes = [permissions.IsAdminUser]
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer

