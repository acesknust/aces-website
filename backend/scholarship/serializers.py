from rest_framework import serializers
from .models import Scholarship
from django.conf import settings

class ScholarshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scholarship
        fields = ('id', 'name', 'description', 'link', 'image')
    

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # Modify the 'event_image' field to include Azure Storage URL
        if instance.image:
            representation['image'] = f"{settings.AZURE_STORAGE_URL}{instance.image.name}"

        return representation