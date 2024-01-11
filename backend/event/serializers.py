from rest_framework import serializers
from django.conf import settings

from .models import Event

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ('id', 'name', 'date', 'time', 'location', 'status', 'image')
    

    def to_representation(self, instance):
        representation = super().to_representation(instance)

        # Modify the 'event_image' field to include Azure Storage URL
        if instance.image:
            representation['image'] = f"{settings.AZURE_STORAGE_URL}{instance.image.name}"

        return representation