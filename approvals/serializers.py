from django.utils import timezone
from medicines.models import Batch
from rest_framework import serializers
from .models import Approval, LabReport

class ApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Approval
        fields = ['id' , 'lab_report' , 'regulator' , 'remarks' , 'status' , 'approved_at' , 'created_at' , 'updated_at']
        read_only_fields = ['id' , 'created_at' , 'updated_at']
        