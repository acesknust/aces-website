from django.shortcuts import render
from rest_framework import generics, permissions, status
from django.conf import settings
from django.core.files.storage import default_storage
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

        # Handle image upload via Django's default storage
        # (routes to Cloudflare R2 in production, local filesystem in dev)
        if 'image' in request.data:
            image = request.data['image']
            image.name = f"{uuid4().hex}.{image.name.split('.')[-1]}"
            path = default_storage.save(f"images/scholarships/{image.name}", image)

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)

class EditScholarship(generics.RetrieveUpdateAPIView):
    """Edit a scholarship"""
    permission_classes = [permissions.IsAdminUser]
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer

    def update(self, request, *args, **kwargs):
        # Handle image upload via Django's default storage
        if 'image' in request.data and hasattr(request.data['image'], 'name'):
            image = request.data['image']
            image.name = f"{uuid4().hex}.{image.name.split('.')[-1]}"
            default_storage.save(f"images/scholarships/{image.name}", image)

        return super().update(request, *args, **kwargs)

class DeleteScholarship(generics.RetrieveDestroyAPIView):
    """Delete a scholarship"""
    permission_classes = [permissions.IsAdminUser]
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer
