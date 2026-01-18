from rest_framework import generics
from .models import AcademicYear
from .serializers import AcademicYearSerializer

class CourseListView(generics.ListAPIView):
    """
    Returns hierarchical list of all active academic years, 
    semesters, and courses.
    """
    serializer_class = AcademicYearSerializer
    pagination_class = None  # Return all data at once to match valid JSON structure
    
    def get_queryset(self):
        return AcademicYear.objects.filter(is_active=True).prefetch_related(
            'semesters',
            'semesters__courses'
        )
