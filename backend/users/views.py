from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser


from .serializers import CustomUserSerializer


# class UserCreate(APIView):
#     """
#     Creates user.
#     """
#     permission_classes = [AllowAny]
    
#     def post(self, request, format='json'):
#         serializer = CustomUserSerializer(data=request.data)
        
#         if serializer.is_valid():
#             user = serializer.save()
            
#             if user:
#                 return Response(serializer.data, status=status.HTTP_201_CREATED)
        
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
 
# use generic views


class UserCreate(generics.CreateAPIView):
    """
    Creates user.
    """
    permission_classes = [AllowAny]
    serializer_class = CustomUserSerializer


    