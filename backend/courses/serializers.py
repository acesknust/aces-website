from rest_framework import serializers
from .models import AcademicYear, Semester, Course, CourseResource


class CourseResourceSerializer(serializers.ModelSerializer):
    """Serializer for individual course resources (files and links)."""
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = CourseResource
        fields = [
            'id', 'title', 'resource_type', 'download_url',
            'file_extension', 'file_size', 'download_count', 'created_at'
        ]

    def get_download_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return obj.external_url


class CourseSerializer(serializers.ModelSerializer):
    resources = CourseResourceSerializer(many=True, read_only=True)
    resource_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'name', 'code', 'resource_url', 'credits',
            'description', 'sort_order', 'resource_count', 'resources'
        ]

    def get_resource_count(self, obj):
        return obj.resources.count()


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

