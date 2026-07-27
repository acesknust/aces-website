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
            'id', 'nominee_name', 'nominee_photo', 'photo_url',
            'category', 'category_name', 'category_group',
            'nominator_name', 'nominator_phone', 'nominator_email',
            'hp_website', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'photo_url', 'category_name', 'category_group']
        extra_kwargs = {
            'nominee_photo': {'required': True, 'write_only': True}
        }

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.nominee_photo and request:
            return request.build_absolute_uri(obj.nominee_photo.url)
        elif obj.nominee_photo:
            return obj.nominee_photo.url
        return None

    def validate_nominee_photo(self, value):
        # 1. Size limit: Max 5 MB
        max_size = 5 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("Photo file size must be less than 5MB.")

        # 2. File Extension
        ext = os.path.splitext(value.name)[1].lower()
        valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
        if ext not in valid_extensions:
            raise serializers.ValidationError("Unsupported image format. Please upload a JPG, JPEG, PNG, or WEBP photo.")

        return value

    def validate_nominator_email(self, value):
        value = value.strip().lower()
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, value):
            raise serializers.ValidationError("Please enter a valid email address.")
        return value

    def validate_nominator_phone(self, value):
        value = value.strip()
        # General phone structure check (allows digits, +, spaces, dashes, parens, 7 to 20 chars)
        phone_regex = r'^\+?[0-9\s\-\(\)]{7,20}$'
        if not re.match(phone_regex, value):
            raise serializers.ValidationError("Please enter a valid phone number.")
        return value

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
