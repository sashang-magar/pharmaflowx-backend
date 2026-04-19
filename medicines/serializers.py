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
        read_only_fields = ['manufacturer','status','created_at','updated_at']

        def validate(self ,attrs):
            expiry_date=attrs.get('expiry_date')
            manufacture_date = attrs.get('manufacture_date')

            if expiry_date and manufacture_date:
                if expiry_date <= manufacture_date:
                    raise serializers.ValidationError('Expiry date must be greater than manufacture date.')
                
            return attrs

        def validate(self , attrs):
            initial_quantity = attrs.get('initial_quantity')    
            current_quantity = attrs.get('current_quantity')    

            if initial_quantity and current_quantity:
                if initial_quantity > current_quantity:
                    raise serializers.ValidationError('Current quantity should not exceed initial quantity')

                