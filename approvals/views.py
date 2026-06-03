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
        
        if user.role == 'LAB':
            return Approval.objects.filter(
                lab_report__lab=user.lab_profile
            ).select_related('lab_report__batch__medicine')

        return Approval.objects.none()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'REGULATOR':
            raise PermissionDenied("Only regulators can create approvals.")
        serializer.save(
            regulator=self.request.user,
            status=Approval.STATUS.UNDER_REVIEW
        )

    def perform_update(self, serializer):
        user = self.request.user
        approval = self.get_object()

        if user.role != 'REGULATOR':
            raise PermissionDenied("Only regulators can update approvals.")

        if approval.regulator != user:
            raise PermissionDenied("You can only update your own approvals.")

        serializer.save()

    def destroy(self, request, *args, **kwargs):
        raise PermissionDenied("Approval records cannot be deleted.")