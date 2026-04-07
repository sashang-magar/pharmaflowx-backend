from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserLoginSerializer , UserRegistrationSerializer

class RegisterView(APIView):
    def post(self , request):
        serializer = UserRegistrationSerializer(data = request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'User registered successfully'} , status=status.HTTP_201_CREATED)



