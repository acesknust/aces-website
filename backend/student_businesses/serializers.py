from rest_framework import serializers
from .models import Business, Product

class ProductSerializer(serializers.ModelSerializer):
    business_name = serializers.CharField(source='business.name', read_only=True)
    business_slug = serializers.CharField(source='business.slug', read_only=True)
    owner_name = serializers.CharField(source='business.owner.username', read_only=True)
    whatsapp_number = serializers.CharField(source='business.whatsapp_number', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

class BusinessSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = Business
        fields = '__all__'
        read_only_fields = ['owner', 'is_approved', 'slug']
