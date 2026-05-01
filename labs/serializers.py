from django.utils import timezone
from medicines.models import Batch
from rest_framework import serializers
from .models import LabReport

class LabReportSerializer(serializers.ModelSerializer):
    lab_name = serializers.CharField(source = 'lab.user.organization' , read_only = True)
    batch_number = serializers.CharField(source = 'batch.batch_number' , read_only = True)
    medicine_name = serializers.CharField(source = 'batch.medicine.brand_name' , read_only = True)
    class Meta:
        model = LabReport
        fields = ['id' ,'batch' ,'lab_name' ,'batch_number','medicine_name','remark' ,
                  'result' ,'tested_at' ,'report_status' ,'report_files' ,'created_at' ]
        read_only_fields = ['id','batch' ,'report_status' ,'tested_at', 'created_at']

    def validate_tested_at(self , value):
        if value > timezone.now():
            raise serializers.ValidationError('Tested data cannot be in future')
        return value
        
    def validate_batch(self , batch):
        if batch.status != Batch.BATCH_CHOICES.LAB_TESTING:
            raise serializers.ValidationError('Report can be submitted only if batch in LAB_TESTING status')
        return batch


            
                