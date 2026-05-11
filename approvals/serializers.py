from django.utils import timezone
from medicines.models import Batch
from rest_framework import serializers
from .models import Approval, LabReport

class ApprovalSerializer(serializers.ModelSerializer):
    batch_number = serializers.CharField(source ='lab_report.batch.batch_number' , read_only = True )
    regulator_name = serializers.CharField(source = 'regulator.user.organization' , read_only =True)
    medicine_name = serializers.CharField(source = 'lab_report.batch.medicine.brand_name' , read_only = True)
    lab_result = serializers.CharField(source = 'lab_report.result' , read_only = True)
    class Meta:
        model = Approval
        fields = ['id' , 'lab_report' , 'regulator_name' , 'batch_number' ,'medicine_name' , 'lab_result',
                  'remarks' , 'status' , 'approved_at' , 'created_at' , 'updated_at']
        read_only_fields = ['id' , 'created_at' , 'updated_at']

    def validate_lab_report(self , lab_report):
        self
