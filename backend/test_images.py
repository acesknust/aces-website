import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from student_businesses.models import Business, Product
from student_businesses.serializers import BusinessSerializer, ProductSerializer
from rest_framework.test import APIRequestFactory

factory = APIRequestFactory()
request = factory.get('/')

print("\n--- BUSINESSES ---")
for b in Business.objects.all():
    serializer = BusinessSerializer(b, context={'request': request})
    print(f"Business: {b.name}")
    print(f"  Logo URL: {serializer.data.get('logo')}")
    print(f"  Banner URL: {serializer.data.get('banner')}")

print("\n--- PRODUCTS ---")
for p in Product.objects.all():
    serializer = ProductSerializer(p, context={'request': request})
    print(f"Product: {p.name}")
    print(f"  Image URL: {serializer.data.get('image')}")
