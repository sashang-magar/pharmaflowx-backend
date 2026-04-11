from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import (UserLoginSerializer , UserRegistrationSerializer ,
                          ManufactureSerializer,LabSerializer , RegulatorSerializer,
                          PharmacySerializer , DistributorSerializer)
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveUpdateAPIView
from .permissions import IsManufacturer , IsLab, IsPharmacy , IsDistributer , IsRegulator

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

class ManufacturerView(RetrieveUpdateAPIView):
    permission_classes=[IsAuthenticated , IsManufacturer]
    serializer_class = ManufactureSerializer

    def get_object(self):
        return self.request.user.manufacturer_profile
class LabView(RetrieveUpdateAPIView):
    permission_classes=[IsAuthenticated , IsLab]
    serializer_class = LabSerializer

    def get_object(self):
        return self.request.user.lab_profile
    
class DistributerView(RetrieveUpdateAPIView):
    permission_classes=[IsAuthenticated , IsDistributer]
    serializer_class = DistributorSerializer

    def get_object(self):
        return self.request.user.distributer_profile
    
class PharmacyView(RetrieveUpdateAPIView):
    permission_classes=[IsAuthenticated , IsPharmacy]
    serializer_class = PharmacySerializer

    def get_object(self):
        return self.request.user.pharmacy_profile
class RegulatorView(RetrieveUpdateAPIView):
    permission_classes=[IsAuthenticated , IsRegulator]
    serializer_class = RegulatorSerializer

    def get_object(self):
        return self.request.user.regulator_profile
    