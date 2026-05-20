from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet
from .serializers import ApprovalSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .models import Approval
# Create your views here.
class ApprovalView(ModelViewSet):
    serializer_class = ApprovalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'REGULATOR':
            return Approval.objects.filter(
                regulator = user
                ).select_related(
                    'lab_report__batch__medicine',
                    'lab_report__batch__manufacturer'
                )
        if user.role == 'MANUFACTURER':
            return Approval.objects.filter(
                lab_report__batch__manufacturer=user.manufacturer_profile
            ).select_related('lab_report__batch__medicine')