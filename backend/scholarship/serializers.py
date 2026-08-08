from rest_framework import serializers
from .models import Scholarship


class ScholarshipSerializer(serializers.ModelSerializer):
    """
    Serializer for the simplified Scholarship model.
    """
    lastUpdated = serializers.DateField(source='last_updated', read_only=True)
    
    class Meta:
        model = Scholarship
        fields = [
            'id',
            'name',
            'description',
            'image',
            'link',
            'eligibility',
            'deadline',
            'status',
            'lastUpdated',
        ]
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Handle image URL
        if instance.image:
            request = self.context.get('request')
            if request:
                representation['image'] = request.build_absolute_uri(instance.image.url)
            else:
                representation['image'] = instance.image.url
        
        return representation