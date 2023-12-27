from django.shortcuts import render
from rest_framework import generics, permissions

from .models import Scholarship
from .serializers import ScholarshipSerializer

class ScholarshipList(generics.ListAPIView):
    """List all scholarships"""
    permission_classes = [permissions.AllowAny]
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer

class CreateScholarship(generics.CreateAPIView):
    """Create a new scholarship only for admin users"""
    permission_classes = [permissions.IsAdminUser]
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer

class EditScholarship(generics.RetrieveUpdateAPIView):
    """Edit a scholarship"""
    permission_classes = [permissions.IsAdminUser]
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer

class DeleteScholarship(generics.RetrieveDestroyAPIView):
    """Delete a scholarship"""
    permission_classes = [permissions.IsAdminUser]
    queryset = Scholarship.objects.all()
    serializer_class = ScholarshipSerializer