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
        if lab_report.report_status != LabReport.LAB_STATUS.SUBMITTED:
            raise serializers.ValidationError(f"Lab report status{lab_report.report_status}."
                                              " Only can approve when lab report is submitted")
        
        if hasattr(lab_report , 'approval') and self.instance is None:
            raise serializers.ValidationError("An approval already exist for this lab report")
        
        return lab_report
    
    def validate_status(self , value):
        if self.instance and value == Approval.STATUS.UNDER_REVIEW:
            raise serializers.ValidationError(" Cannot revert status back to Under Review")
        
        return value
