from rest_framework import generics, permissions
from django.shortcuts import get_object_or_404
from .models import Business, Product
from .serializers import BusinessSerializer, ProductSerializer

class BusinessList(generics.ListCreateAPIView):
    serializer_class = BusinessSerializer

    def get_queryset(self):
        return Business.objects.filter(is_approved=True)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class BusinessDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BusinessSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Business.objects.filter(is_approved=True) | Business.objects.filter(owner=self.request.user)
        return Business.objects.filter(is_approved=True)

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

class MyBusinessList(generics.ListAPIView):
    serializer_class = BusinessSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Business.objects.filter(owner=self.request.user)

class ProductListCreate(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(business__owner=self.request.user)

    def perform_create(self, serializer):
        business_id = self.request.data.get('business')
        business = get_object_or_404(Business, id=business_id, owner=self.request.user)
        serializer.save(business=business)

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(business__owner=self.request.user)
