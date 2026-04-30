from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from labs.models import LabReport
from labs.serializers import LabReportSerializer 
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsManufacturer, IsLab, IsRegulator
from rest_framework.exceptions import PermissionDenied

class LabReportView(ModelViewSet):
    serializer_class = LabReportSerializer

    def get_permissions(self):
        if self.action in ['create' , 'update' , 'partial_update']:
            return [IsAuthenticated() , IsLab()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user

        if user.role == 'LAB':
            return LabReport.objects.filter(lab=user).select_related('batch__medicine')
        
        if user.role == 'MANUFACTURER':
            return LabReport.objects.filter(batch__manufacturer = user).select_related('batch__medicine')
        
        if user.role == 'REGULATOR':
            return LabReport.objects.filter(report_status =LabReport.LAB_STATUS.SUBMITTED).select_related('batch__medicine')
        
        return LabReport.objects.none()
    
    def perform_create(self, serializer):
        user = self.request.user
        report = self.get_object()

        if user.role == 'LAB':
            if report.lab != user:
                raise PermissionDenied('Only lab can submit report')
        
            if report.report_status != LabReport.LAB_STATUS.PENDING:
                raise PermissionDenied('Cannot edit subbmited/reviewed report')
            
            serializer.save()
            return
        
        elif user.role == 'MANUFACTURER':
            serializer.save(report_status = LabReport.LAB_STATUS.REVIEWED)

        else:
            raise PermissionDenied('You cannot update lab report')    
