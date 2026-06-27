from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import Inventory
from .serializers import InventorySerializer
from accounts.permissions import IsDistributer

class InventoryView(ModelViewSet):
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'DISTRIBUTOR':
            # distributor sees only their own stock
            return Inventory.objects.filter(
                distributor=user.distributor_profile
            ).select_related('batch__medicine')

        if user.role == 'PHARMACY':
            # pharmacy sees all inventory that has available stock
            return Inventory.objects.filter(
                quantity__gt=0
            ).select_related('batch__medicine', 'distributor')

        return Inventory.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != 'DISTRIBUTOR':
            raise PermissionDenied("Only distributors can add inventory.")
        serializer.save(distributor=self.request.user.distributor_profile)

    def perform_update(self, serializer):
        if self.request.user.role != 'DISTRIBUTOR':
            raise PermissionDenied("Only distributors can update inventory.")
        # make sure distributor only updates their own stock
        inventory = self.get_object()
        if inventory.distributor != self.request.user.distributor_profile:
            raise PermissionDenied("You can only update your own inventory.")
        serializer.save()

    def destroy(self, request, *args, **kwargs):
        raise PermissionDenied("Inventory records cannot be deleted.")

    # custom endpoint: GET /api/inventory/expiring-soon/
    @action(detail=False, methods=['get'], url_path='expiring-soon')
    def expiring_soon(self, request):
        if request.user.role != 'DISTRIBUTOR':
            raise PermissionDenied("Only distributors can view expiring stock.")

        threshold = timezone.now().date() + timedelta(days=30)
        queryset = Inventory.objects.filter(
            distributor=request.user.distributor_profile,
            batch__expiry_date__lte=threshold,
            quantity__gt=0
        ).select_related('batch__medicine')

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    # custom endpoint: GET /api/inventory/low-stock/
    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        if request.user.role != 'DISTRIBUTOR':
            raise PermissionDenied("Only distributors can view low stock.")

        # items where available quantity is below 100 — adjust threshold as needed
        # queryset = Inventory.objects.filter(
        #     distributor=request.user.distributor_profile,
        #     quantity__lt=100
        # ).select_related('batch__medicine')

        #changes from this to below due to reorder point algorithm
        
        # compare actual quantity against calculated reorder_threshold
        from django.db.models import F
        queryset = Inventory.objects.filter(
            distributor=request.user.distributor_profile,
            quantity__lt=F('reorder_threshold')  # dynamic — uses each item's threshold
        ).select_related('batch__medicine')


        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)