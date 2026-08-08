from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import AnonRateThrottle
from django.db.models import F
from .models import AcademicYear, CourseResource
from .serializers import AcademicYearSerializer


class CourseListView(generics.ListAPIView):
    """
    Returns hierarchical list of all active academic years, 
    semesters, courses, and their resources.
    """
    serializer_class = AcademicYearSerializer
    pagination_class = None  # Return all data at once to match valid JSON structure
    
    def get_queryset(self):
        return AcademicYear.objects.filter(is_active=True).prefetch_related(
            'semesters',
            'semesters__courses',
            'semesters__courses__resources',  # Prefetch resources to prevent N+1
        )


class DownloadRateThrottle(AnonRateThrottle):
    """Limit downloads to 30 per minute per IP to prevent stat padding."""
    rate = '30/min'


class TrackDownloadView(APIView):
    """
    Increment download counter for a course resource.
    Fire-and-forget — always returns 204 No Content.
    Rate limited to prevent abuse.
    """
    throttle_classes = [DownloadRateThrottle]

    def post(self, request, pk):
        CourseResource.objects.filter(pk=pk, is_active=True).update(
            download_count=F('download_count') + 1
        )
        return Response(status=status.HTTP_204_NO_CONTENT)


