from rest_framework import serializers, viewsets
from rest_framework.response import Response
from .models import AcademicYear, Executive, SocialLink

class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['platform', 'url']

class ExecutiveSerializer(serializers.ModelSerializer):
    display_position = serializers.CharField(source='get_position_display', read_only=True)
    sort_order = serializers.IntegerField(read_only=True)
    image = serializers.SerializerMethodField()
    social_links = serializers.SerializerMethodField()
    
    class Meta:
        model = Executive
        fields = ['id', 'name', 'position', 'display_position', 'image', 'sort_order', 'social_links']
    
    def get_social_links(self, obj):
        links = obj.social_links.filter(is_visible=True)
        return SocialLinkSerializer(links, many=True).data

    def get_image(self, obj):
        """Return absolute URL for the image"""
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return obj.image.url
        return None

class AcademicYearSerializer(serializers.ModelSerializer):
    executives = serializers.SerializerMethodField()
    hero_banner = serializers.SerializerMethodField()
    
    class Meta:
        model = AcademicYear
        fields = ['id', 'name', 'hero_banner', 'description', 'show_description', 'is_current', 'executives']
    
    def get_hero_banner(self, obj):
        """Return absolute URL for the hero banner"""
        request = self.context.get('request')
        if obj.hero_banner and request:
            return request.build_absolute_uri(obj.hero_banner.url)
        elif obj.hero_banner:
            return obj.hero_banner.url
        return None
    
    def get_executives(self, obj):
        # Sort executives by position order (President first, Women's Commissioner last)
        executives = obj.executives.all()
        sorted_executives = sorted(executives, key=lambda x: x.sort_order)
        # Pass request context to nested serializer
        return ExecutiveSerializer(sorted_executives, many=True, context=self.context).data

class ExecutiveViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AcademicYear.objects.prefetch_related('executives').all()
    serializer_class = AcademicYearSerializer
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        
        # Determine current year for frontend convenience
        try:
            current_year = queryset.get(is_current=True).name
        except AcademicYear.DoesNotExist:
            current_year = queryset.first().name if queryset.exists() else None
            
        return Response({
            'current_year': current_year,
            'years': serializer.data
        })
