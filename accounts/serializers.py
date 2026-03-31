from rest_framework import serializers
from .models import User , ManufacturerProfile , LabProfile , RegulatorProfile, PharmacyProfile , DistributorProfile
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True, validate_password = [validate_password] , required = True)
    password2 = serializers.CharField(write_only = True , required=True)

    class Meta:
        model = User
        fields = ['username' , 'password','password2' ,'email' , 'phone' , 'role' ,'address']
        extra_kwargs = {
            'phone' :{'required' : True},
        }
            
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError('Password did not match')
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user      
         