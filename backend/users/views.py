import logging

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .serializers import CustomUserSerializer, NewsletterSubscriberSerializer

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _authenticate(email, password):
    """
    Authenticate a user by email and password.
    Returns the user instance or None.
    """
    try:
        user = CustomUser.objects.get(email__iexact=email)
        if user.check_password(password):
            return user
        return None
    except CustomUser.DoesNotExist:
        return None


def _jwt_response(user):
    """Generate a standard JWT token pair response for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'is_staff': user.is_staff,
        'username': user.username,
    }


# ---------------------------------------------------------------------------
# Auth Views
# ---------------------------------------------------------------------------

class AdminLoginView(APIView):
    """Login endpoint restricted to staff/admin users."""
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = _authenticate(email, password)

        if user is not None and user.is_staff:
            return Response(_jwt_response(user), status=status.HTTP_200_OK)

        return Response(
            {'detail': 'Invalid credentials or insufficient privileges.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )


class StudentLoginView(APIView):
    """Login endpoint for all users (students and admins)."""
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'detail': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = _authenticate(email, password)

        if user is not None:
            return Response(_jwt_response(user), status=status.HTTP_200_OK)

        return Response(
            {'detail': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )


class StudentRegisterView(APIView):
    """Register a new student account."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Account created successfully! You can now log in.'},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Blacklist the refresh token to log the user out."""
    permission_classes = [AllowAny]

    def post(self, request, format=None):
        refresh_token = request.data.get('refresh_token') or request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'detail': 'refresh_token is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(
                {'detail': 'Invalid or expired token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )


# ---------------------------------------------------------------------------
# Newsletter
# ---------------------------------------------------------------------------

class SubscribeNewsletterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = NewsletterSubscriberSerializer