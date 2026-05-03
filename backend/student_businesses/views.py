from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404
from .models import Business, Product
from .serializers import BusinessSerializer, ProductSerializer


# ---------------------------------------------------------------------------
# Custom Permissions
# ---------------------------------------------------------------------------

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Only allow the owner of an object to edit/delete it."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user


# ---------------------------------------------------------------------------
# Business Views
# ---------------------------------------------------------------------------

class BusinessList(generics.ListCreateAPIView):
    """
    GET  — List all approved businesses (public).
    POST — Create a new business (authenticated users only).
    """
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
    """
    GET    — Retrieve a business (approved OR owned by requester).
    PUT/PATCH/DELETE — Only the business owner.
    """
    serializer_class = BusinessSerializer
    lookup_field = 'slug'

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return (
                Business.objects.filter(is_approved=True)
                | Business.objects.filter(owner=self.request.user)
            )
        return Business.objects.filter(is_approved=True)

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.AllowAny()]


class MyBusinessList(generics.ListAPIView):
    """List businesses owned by the current authenticated user."""
    serializer_class = BusinessSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Business.objects.filter(owner=self.request.user)


# ---------------------------------------------------------------------------
# Product Views
# ---------------------------------------------------------------------------

class ProductListCreate(generics.ListCreateAPIView):
    """
    GET  — List the current user's products.
    POST — Create a new product (must own the target business).
    """
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(business__owner=self.request.user)

    def perform_create(self, serializer):
        business_id = self.request.data.get('business')
        business = get_object_or_404(Business, id=business_id, owner=self.request.user)
        serializer.save(business=business)


class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve/update/delete a product owned by the current user."""
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(business__owner=self.request.user)


class GlobalProductList(generics.ListAPIView):
    """
    Public endpoint: list all available products from approved businesses.
    Supports ?category= query parameter for filtering.
    """
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Product.objects.filter(
            business__is_approved=True,
            is_available=True,
        ).select_related('business', 'business__owner')

        category = self.request.query_params.get('category')
        if category and category != 'All':
            qs = qs.filter(category__icontains=category)

        return qs
