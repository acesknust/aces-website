from rest_framework import serializers
from .models import Business, Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image and request:
            data['image'] = request.build_absolute_uri(instance.image.url)
        elif instance.image:
            data['image'] = instance.image.url
        return data


class ProductSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.name', read_only=True)
    business_slug = serializers.CharField(source='business.slug', read_only=True)
    owner_name = serializers.CharField(source='business.owner.username', read_only=True)
    whatsapp_number = serializers.CharField(source='business.whatsapp_number', read_only=True)
    additional_images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'business', 'name', 'category', 'description',
            'price', 'image', 'is_available', 'created_at',
            'business_name', 'business_slug', 'owner_name',
            'whatsapp_number', 'additional_images',
        ]
        read_only_fields = ['business', 'created_at']

    def to_representation(self, instance):
        """Override to return absolute URLs for the image field."""
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image and request:
            data['image'] = request.build_absolute_uri(instance.image.url)
        elif instance.image:
            data['image'] = instance.image.url
        return data


class BusinessSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Business
        fields = '__all__'
        read_only_fields = ['owner', 'is_approved', 'slug']

    def to_representation(self, instance):
        """Override to return absolute URLs for image fields."""
        data = super().to_representation(instance)
        request = self.context.get('request')

        if instance.logo and request:
            data['logo'] = request.build_absolute_uri(instance.logo.url)
        elif instance.logo:
            data['logo'] = instance.logo.url

        if instance.banner and request:
            data['banner'] = request.build_absolute_uri(instance.banner.url)
        elif instance.banner:
            data['banner'] = instance.banner.url

        return data
