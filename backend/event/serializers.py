from rest_framework import serializers
from .models import Event

class EventSerializer(serializers.ModelSerializer):
    status = serializers.ReadOnlyField()

    class Meta:
        model = Event
        fields = ('id', 'name', 'slug', 'description', 'date', 'time', 'location', 'location_url', 'status', 'image', 'created_at')
