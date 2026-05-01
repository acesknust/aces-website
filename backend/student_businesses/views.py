from rest_framework import generics, permissions
from .models import Business, Product
from .serializers import BusinessSerializer, ProductSerializer

class BusinessList(generics.ListCreateAPIView):
    serializer_class = BusinessSerializer

    def get_queryset(self):
        # Only show approved businesses on the public listing
        return Business.objects.filter(is_approved=True)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class BusinessDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Business.objects.all()
    serializer_class = BusinessSerializer
    lookup_field = 'slug'

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
        # Ensure the user owns the business they are adding a product to
        business_id = self.request.data.get('business')
        business = Business.objects.get(id=business_id, owner=self.request.user)
        serializer.save(business=business)

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Product.objects.filter(business__owner=self.request.user)
