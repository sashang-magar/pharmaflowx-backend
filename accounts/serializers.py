from rest_framework import serializers
from .models import User , ManufacturerProfile , LabProfile , RegulatorProfile, PharmacyProfile , DistributorProfile
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True, validators= [validate_password] , required = True)
    password2 = serializers.CharField(write_only = True , required=True)

    class Meta:
        model = User
        fields = ['username' , 'password','password2' ,'email' , 'phone' ,'organization' , 'role' ,'address']
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
         

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
    )

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            #  authenticate with username
            user = authenticate(username=username, password=password)
            
            # If not found, try with email
            if not user:
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            
            # Check authentication result
            if not user:
                raise serializers.ValidationError("Invalid credentials")
        
            if not user.is_active:
                raise serializers.ValidationError("Account is disabled")
        else:
            raise serializers.ValidationError({
                'error': 'Must include "username" and "password".'
            })

        attrs['user'] = user
        return attrs    
    

class ManufactureSerializer(serializers.ModelSerializer):    
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    organization = serializers.CharField(source='user.organization', read_only=True)
    address = serializers.CharField(source='user.address', read_only=True)
    class Meta:
        model = ManufacturerProfile
        fields = ['id' , 'email', 'phone', 'organization','address', 'license_expiry_date' ,
                  'license_number' , 'company_name' ,'trust_score' , 'created_at']
        read_only_fields = ['id' , 'trust_score' , 'created_at' ]

class LabSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source = 'user.username' , read_only = True)
    email = serializers.EmailField(source='user.email' , read_only = 'True')
    phone = serializers.CharField(source = 'user.phone' , read_only = True)
    organization = serializers.CharField(source = 'user.organization' , read_only = True)
    address = serializers.CharField(source = 'user.address' , read_only= True)
    class Meta:
        model = LabProfile
        fields = ['id' ,'email', 'phone', 'organization','address','accreditation_expiry_date' ,
                   'accreditation_number' ,'lab_type' ,'testing_capabilities' ,'created_at']      
        read_only_fields = ['id' ,'created_at', ]  

class DistributorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source = 'user.username' , read_only = True)
    email = serializers.EmailField(source='user.email' , read_only = 'True')
    phone = serializers.CharField(source = 'user.phone' , read_only = True)
    organization = serializers.CharField(source = 'user.organization' , read_only = True)
    address = serializers.CharField(source = 'user.address' , read_only= True)
    class Meta:
        model = DistributorProfile
        fields = ['id' , 'email', 'phone', 'organization','address','license_number' ,
                  'license_expiry_date' ,'created_at']
        read_only_fields = ['id' , 'created_at']

class PharmacySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source = 'user.username' , read_only = True)
    email = serializers.EmailField(source='user.email' , read_only = 'True')
    phone = serializers.CharField(source = 'user.phone' , read_only = True)
    organization = serializers.CharField(source = 'user.organization' , read_only = True)
    address = serializers.CharField(source = 'user.address' , read_only= True)
    class Meta:
        model = PharmacyProfile
        fields = ['id' ,'email', 'phone', 'organization','address','license_number' ,
                  'license_expiry_date' ,'pharmacy_type' ,'created_at']  
        read_only_fields = ['id' ,'created_at']      
        
class RegulatorSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source = 'user.username' , read_only = True)
    email = serializers.EmailField(source='user.email' , read_only = 'True')
    phone = serializers.CharField(source = 'user.phone' , read_only = True)
    organization = serializers.CharField(source = 'user.organization' , read_only = True)
    address = serializers.CharField(source = 'user.address' , read_only= True)
    class Meta:
        model = RegulatorProfile
        fields = ['id' ,'email', 'phone', 'organization','address', 'department' ,'created_at']    
        read_only_fields = ['id' ,'created_at']   