from rest_framework import generics, mixins, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from .models import CustomUser, Role
from .perks import PERKS, IsSuperAdmin, user_perks
from .serializers import CustomUserSerializer, MemberSerializer, NewsletterSubscriberSerializer, RoleSerializer


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
        'is_superuser': user.is_superuser,
        'username': user.username,
        'perks': sorted(user_perks(user)),
    }


# ---------------------------------------------------------------------------
# Auth Views
# ---------------------------------------------------------------------------

class AdminLoginView(APIView):
    """Login endpoint restricted to staff/admin users and role holders."""
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

        if user is not None and user.is_active and (user.is_staff or user_perks(user)):
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


# ---------------------------------------------------------------------------
# Roles & perks (managed by super admins / project managers)
# ---------------------------------------------------------------------------

class MeView(APIView):
    """The signed-in user's identity and perks, used by the admin dashboard."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'email': user.email,
            'username': user.username,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'perks': sorted(user_perks(user)),
        })


class PerkListView(APIView):
    """All perks a role can include."""
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        return Response([{'code': code, 'label': label} for code, label in PERKS.items()])


class RoleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsSuperAdmin]
    queryset = Role.objects.prefetch_related('users')
    serializer_class = RoleSerializer


class MemberViewSet(mixins.ListModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    """List users and set which roles each one holds."""
    permission_classes = [IsSuperAdmin]
    serializer_class = MemberSerializer
    http_method_names = ['get', 'patch']

    def get_queryset(self):
        qs = CustomUser.objects.prefetch_related('roles').order_by('username')
        search = self.request.query_params.get('search', '').strip()
        if search:
            qs = qs.filter(Q(email__icontains=search) | Q(username__icontains=search))
        if self.request.query_params.get('with_roles') == '1':
            qs = qs.filter(roles__isnull=False).distinct()
        return qs

    def list(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_queryset()[:100], many=True)
        return Response(serializer.data)
