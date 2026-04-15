from rest_framework import serializers
from .models import Medicine , Batch 
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields= [ 'id' , 'manufacturer','brand_name','description','generic_name',
                 'composition','unit_type','dosage_form','strength','created_at','updated_at']
        read_only_fields = ['manufacturer','created_at','updated_at']

class BatchSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Batch
        fields= [ 'id' ,'medicine', 'manufacturer','batch_number','manufacture_date','expiry_date',
                 'initial_quantity','current_quantity','mrp','status','created_at','updated_at']
        read_only_fields = ['medicine', 'manufacturer','status','created_at','updated_at']
                