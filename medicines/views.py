from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet 
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter , OrderingFilter
from medicines.models import Medicine , Batch
from medicines.serializers import MedicineSerializer ,BatchSerializer
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsManufacturer, IsLab, IsRegulator
# from store.permissions import FullDjangoModelPermission, IsAdminOrReadOnly
# from store.pagination import DefaultPagination

class MedicineViewSet(ModelViewSet):
    serializer_class = MedicineSerializer
    # permission_classes = [IsAuthenticated , IsManufacturer]

    def get_permissions(self):
        if self.action == 'create':
            return [IsManufacturer()] 
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'MANUFACTURER':
            return Medicine.objects.filter(manufacturer = user.manufacturer_profile)
        
        elif user.role in ['LAB' , 'REGULATOR' , 'PHARMACY' , 'DISTRIBUTER']:
            return Medicine.objects.all()
        
        return Medicine.objects.none()
    
    def perform_create(self, serializer):
        return serializer.save(manufacturer = self.request.user.manufacturer_profile)

class BatchViewSet(ModelViewSet):
    serializer_class = BatchSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [IsManufacturer()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user

        if user.role == 'MANUFACTURER':
            return Batch.objects.filter(manufacturer = user.manufacturer_profile).select_related('medicine')
        
        elif user.role in ['LAB' , 'REGULATOR' , 'PHARMACY' , 'DISTRIBUTER']:
            return Batch.objects.all().select_related('medicine' ,'manufacturer')
        
        return Batch.objects.none()
    
    def perform_create(self, serializer):
        return serializer.save(manufacturer = self.request.user.manufacturer_profile , status = 'IN_PRODUCTION')


