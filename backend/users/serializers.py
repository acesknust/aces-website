from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import CustomUser, NewsletterSubscriber, Role
from .perks import PERKS


class CustomUserSerializer(serializers.ModelSerializer):
    """
    Serializer for student registration.
    Validates email uniqueness, username uniqueness, and password strength
    using Django's built-in password validators.
    """
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True, min_length=3, max_length=150)
    password = serializers.CharField(min_length=8, write_only=True)

    class Meta:
        model = CustomUser
        fields = ('email', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        """Ensure the email is not already taken."""
        if CustomUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value.lower()

    def validate_username(self, value):
        """Ensure the username is not already taken."""
        if CustomUser.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_password(self, value):
        """Run Django's built-in password validators."""
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ('email',)

class RoleSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(source='users.count', read_only=True)

    class Meta:
        model = Role
        fields = ('id', 'name', 'description', 'perks', 'member_count', 'created_at')
        read_only_fields = ('created_at',)

    def validate_perks(self, value):
        unknown = [code for code in value if code not in PERKS]
        if unknown:
            raise serializers.ValidationError(f"Unknown perks: {', '.join(unknown)}")
        return sorted(set(value))


class MemberSerializer(serializers.ModelSerializer):
    """A user as seen by a super admin when handing out roles."""
    roles = serializers.PrimaryKeyRelatedField(many=True, queryset=Role.objects.all())

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'username', 'is_staff', 'is_superuser', 'roles')
        read_only_fields = ('email', 'username', 'is_staff', 'is_superuser')
