from rest_framework import viewsets, permissions
from .models import Event
from .serializers import EventSerializer
from users.perks import HasPerkOrReadOnly

class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows events to be viewed or edited.
    Standard Django storage is used for images (DigitalOcean/Local).
    """
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [HasPerkOrReadOnly('manage_events', staff_allowed=True)]
    lookup_field = 'slug'  # Or 'id', but slug is nicer for URLs
