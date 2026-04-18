from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet 
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter , OrderingFilter
from medicines.models import Medicine
from medicines.serializers import MedicineSerializer
from rest_framework.permissions import IsAuthenticated
from store.permissions import FullDjangoModelPermission, IsAdminOrReadOnly
from store.pagination import DefaultPagination

class MedicineViewSet(ModelViewSet):
    serializer_class = MedicineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Medicine.objects.filter(manufacturer = self.request.user)
