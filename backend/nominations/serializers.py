import os
import re
from rest_framework import serializers
from .models import Category, Nomination, NominationSettings

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'group_name', 'name', 'is_active']


class NominationSerializer(serializers.ModelSerializer):
    hp_website = serializers.CharField(
        required=False,
        write_only=True,
        allow_blank=True,
        help_text="Honeypot anti-spam field"
    )
    photo_url = serializers.SerializerMethodField(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_group = serializers.CharField(source='category.group_name', read_only=True)

    class Meta:
        model = Nomination
        fields = [
            'id', 'nominee_name', 'nominee_whatsapp', 'nominee_phone', 'nominee_email',
            'nominee_photo', 'photo_url',
            'category', 'category_name', 'category_group',
            'nominator_name', 'nominator_phone', 'nominator_email',
            'hp_website', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'photo_url', 'category_name', 'category_group']
        extra_kwargs = {
            'nominee_name': {'required': True},
            'nominee_whatsapp': {'required': True},
            'nominee_phone': {'required': False, 'allow_blank': True, 'allow_null': True},
            'nominee_email': {'required': False, 'allow_blank': True, 'allow_null': True},
            'nominee_photo': {'required': False, 'allow_null': True, 'write_only': True},
            'nominator_name': {'required': False, 'allow_blank': True, 'allow_null': True},
            'nominator_phone': {'required': False, 'allow_blank': True, 'allow_null': True},
            'nominator_email': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.nominee_photo and request:
            return request.build_absolute_uri(obj.nominee_photo.url)
        elif obj.nominee_photo:
            return obj.nominee_photo.url
        return None

    def validate_nominee_whatsapp(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Nominee WhatsApp number is required.")
        val = value.strip()
        phone_regex = r'^\+?[0-9\s\-\(\)]{7,20}$'
        if not re.match(phone_regex, val):
            raise serializers.ValidationError("Please enter a valid WhatsApp number.")
        return val

    def validate(self, attrs):
        # 1. Honeypot check: If filled, fail immediately
        hp_val = attrs.get('hp_website')
        if hp_val and len(hp_val.strip()) > 0:
            raise serializers.ValidationError({"detail": "Spam detected."})

        # 2. Check if nominations are currently open
        settings = NominationSettings.get_settings()
        if not settings.is_open:
            raise serializers.ValidationError({"detail": "Nominations are currently closed."})

        # 3. Duplicate check (Nominee Name + Category)
        nominee_name = attrs.get('nominee_name', '').strip()
        category = attrs.get('category')

        if nominee_name and category:
            normalized_name = " ".join(nominee_name.split()).lower()
            if Nomination.objects.filter(category=category, nominee_name_normalized=normalized_name).exists():
                raise serializers.ValidationError({
                    "nominee_name": "This person has already been nominated for this category."
                })

        return attrs
