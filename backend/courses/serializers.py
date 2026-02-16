from rest_framework import serializers
from .models import AcademicYear, Semester, Course

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'name', 'code', 'resource_url', 'credits', 'description', 'sort_order']

class SemesterSerializer(serializers.ModelSerializer):
    courses = CourseSerializer(many=True, read_only=True)
    
    class Meta:
        model = Semester
        fields = ['id', 'semester_number', 'semester_name', 'courses']

class AcademicYearSerializer(serializers.ModelSerializer):
    semesters = SemesterSerializer(many=True, read_only=True)
    
    class Meta:
        model = AcademicYear
        fields = ['year', 'year_name', 'semesters']
