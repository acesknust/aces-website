from rest_framework import generics
from .models import StaffMember
from .serializers import StaffMemberSerializer


class StaffMemberListView(generics.ListAPIView):
    """
    Returns all active staff members, ordered by display_order.
    """
    serializer_class = StaffMemberSerializer
    
    def get_queryset(self):
        return StaffMember.objects.filter(is_active=True)
