from django.db import IntegrityError
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Category, Nomination, NominationSettings
from .serializers import CategorySerializer, NominationSerializer

class NominationSubmissionThrottle(AnonRateThrottle):
    rate = '10/hour'


class CategoryListView(generics.ListAPIView):
    """
    Returns only active categories (is_active=True).
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = []
    authentication_classes = []


class NominationStatusView(APIView):
    """
    Returns whether public nominations are currently open (is_open).
    """
    permission_classes = []
    authentication_classes = []

    def get(self, request):
        settings = NominationSettings.get_settings()
        return Response({'is_open': settings.is_open})


class NominationCreateView(generics.CreateAPIView):
    """
    Accepts multipart form submissions for new nominations.
    Includes rate throttling and race condition backstop handling.
    """
    queryset = Nomination.objects.all()
    serializer_class = NominationSerializer
    permission_classes = []
    authentication_classes = []
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [NominationSubmissionThrottle]

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {"nominee_name": ["This person has already been nominated for this category."]},
                status=status.HTTP_400_BAD_REQUEST
            )
