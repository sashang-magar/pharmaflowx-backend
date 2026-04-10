from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserLoginSerializer , UserRegistrationSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

class RegisterView(APIView):
    def post(self , request):
        serializer = UserRegistrationSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message' : 'User registered successfully'} , status=status.HTTP_201_CREATED)
    
class LoginView(APIView):
    def post(self , request):
        serializer = UserLoginSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'message': 'Login successful'
        }, status=status.HTTP_200_OK) 

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self , request):
        user = request.user 
        return Response({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'phone': user.phone,
                'organization' : user.organization,
                'role': user.role,
                'address': user.address,

        })

