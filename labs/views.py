from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from labs.serializers import LabReportSerializer 
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsManufacturer, IsLab, IsRegulator

class LabReportView(ModelViewSet):
    serializer_class = LabReportSerializer

    def get_permissions(self):
        if self.action in ['create' , 'update' , 'partial_update']:
            return [IsAuthenticated() , IsLab()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        return super().get_queryset()
