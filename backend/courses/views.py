from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, F
from .models import AcademicYear, Course, CourseResource
from .serializers import AcademicYearSerializer, CourseSerializer


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


class CourseSearchView(generics.ListAPIView):
    """
    Search courses by name or code.
    Usage: GET /api/courses/search/?q=COE+252
    Returns a flat list of matching courses (max 20).
    """
    serializer_class = CourseSerializer
    pagination_class = None

    def get_queryset(self):
        q = self.request.query_params.get('q', '').strip()
        if not q or len(q) < 2:
            return Course.objects.none()
        return Course.objects.filter(
            Q(name__icontains=q) | Q(code__icontains=q)
        ).select_related(
            'semester__academic_year'
        ).prefetch_related('resources')[:20]


class TrackDownloadView(APIView):
    """
    Increment download counter for a course resource.
    Fire-and-forget — always returns 204 No Content.
    Frontend calls this when a student clicks a download link.
    """
    def post(self, request, pk):
        updated = CourseResource.objects.filter(pk=pk, is_active=True).update(
            download_count=F('download_count') + 1
        )
        return Response(status=status.HTTP_204_NO_CONTENT)

