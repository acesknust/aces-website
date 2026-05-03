from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Business, Product, ProductImage
from .serializers import BusinessSerializer, ProductSerializer, ProductImageSerializer


# ---------------------------------------------------------------------------
# Custom Permissions
# ---------------------------------------------------------------------------

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Only allow the owner of an object to edit/delete it."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # For Business objects
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        # For Product objects
        if hasattr(obj, 'business'):
            return obj.business.owner == request.user
        return False


# ---------------------------------------------------------------------------
# Business Views
# ---------------------------------------------------------------------------

class BusinessList(generics.ListCreateAPIView):
    """
    GET  — List all approved businesses (public).
    POST — Create a new business (authenticated, one per user).
    """
    serializer_class = BusinessSerializer

    def get_queryset(self):
        return Business.objects.filter(is_approved=True).select_related('owner')

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
            return Business.objects.filter(
                Q(is_approved=True) | Q(owner=self.request.user)
            ).select_related('owner').prefetch_related('products__additional_images')
        return Business.objects.filter(is_approved=True).select_related('owner').prefetch_related('products__additional_images')

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]
        return [permissions.AllowAny()]


class MyBusinessList(generics.ListAPIView):
    """List businesses owned by the current authenticated user."""
    serializer_class = BusinessSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Business.objects.filter(owner=self.request.user).prefetch_related('products__additional_images')


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
        return Product.objects.filter(
            business__owner=self.request.user
        ).select_related('business').prefetch_related('additional_images')

    def perform_create(self, serializer):
        business_id = self.request.data.get('business')
        business = get_object_or_404(Business, id=business_id, owner=self.request.user)
        product = serializer.save(business=business)

        additional_images = self.request.FILES.getlist('additional_images')
        for img in additional_images:
            ProductImage.objects.create(product=product, image=img)


class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve/update/delete a product owned by the current user."""
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Product.objects.filter(
            business__owner=self.request.user
        ).select_related('business').prefetch_related('additional_images')

    def update(self, request, *args, **kwargs):
        """Handle product update and optionally add more gallery images."""
        response = super().update(request, *args, **kwargs)
        # Append any new additional images uploaded during update
        additional_images = request.FILES.getlist('additional_images')
        if additional_images:
            product = self.get_object()
            for img in additional_images:
                ProductImage.objects.create(product=product, image=img)
        return response


class ProductImageDelete(APIView):
    """Allow a vendor to delete a specific gallery image from their product."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        image = get_object_or_404(ProductImage, pk=pk)
        # Ensure the user owns the product this image belongs to
        if image.product.business.owner != request.user:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        image.image.delete(save=False)  # Delete from storage too
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class GlobalProductList(generics.ListAPIView):
    """
    Public endpoint: list all available products from approved businesses.
    Supports ?search= and ?category= query parameters.
    """
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Product.objects.filter(
            business__is_approved=True,
            is_available=True,
        ).select_related('business', 'business__owner').prefetch_related('additional_images')

        category = self.request.query_params.get('category')
        if category and category != 'All':
            qs = qs.filter(category__icontains=category)

        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(business__name__icontains=search)
            )

        return qs
