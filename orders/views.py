from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .models import Order, Review
from .serializers import (
    OrderSerializer, OrderCreateSerializer,
    OrderStatusUpdateSerializer, ReviewSerializer
)
from .services import place_order, deliver_order, cancel_order


class OrderViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        if self.action in ['update', 'partial_update']:
            return OrderStatusUpdateSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role == 'PHARMACY':
            return Order.objects.filter(
                pharmacy=user.pharmacy_profile
            ).prefetch_related(
                'items__inventory__batch__medicine',
                'items__batch'
            )

        if user.role == 'DISTRIBUTOR':
            return Order.objects.filter(
                distributor=user.distributor_profile
            ).prefetch_related(
                'items__inventory__batch__medicine',
                'items__batch'
            )

        return Order.objects.none()

    def create(self, request, *args, **kwargs):
        if request.user.role != 'PHARMACY':
            raise PermissionDenied("Only pharmacies can place orders.")

        # validate incoming data
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # pass validated data to service
        order = place_order(
            pharmacy_profile=request.user.pharmacy_profile,
            distributor_profile=data['distributor'],
            items_data=data['items'],
            payment_method=data['payment_method']
        )

        # return full order data
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )

    def perform_update(self, serializer):
        if self.request.user.role != 'DISTRIBUTOR':
            raise PermissionDenied("Only distributors can update order status.")
        order = self.get_object()
        if order.distributor != self.request.user.distributor_profile:
            raise PermissionDenied("You can only update your own orders.")
        serializer.save()

    @action(detail=True, methods=['post'], url_path='deliver')
    def deliver(self, request, pk=None):
        if request.user.role != 'DISTRIBUTOR':
            raise PermissionDenied("Only distributors can mark orders delivered.")
        order = self.get_object()
        if order.distributor != request.user.distributor_profile:
            raise PermissionDenied("You can only deliver your own orders.")
        order = deliver_order(order)
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        order = self.get_object()
        if request.user.role == 'PHARMACY':
            if order.pharmacy != request.user.pharmacy_profile:
                raise PermissionDenied("You can only cancel your own orders.")
        elif request.user.role == 'DISTRIBUTOR':
            if order.distributor != request.user.distributor_profile:
                raise PermissionDenied("You can only cancel your own orders.")
        else:
            raise PermissionDenied("You cannot cancel orders.")
        order = cancel_order(order)
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK
        )

    def destroy(self, request, *args, **kwargs):
        raise PermissionDenied("Orders cannot be deleted.")


class ReviewViewSet(ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'PHARMACY':
            return Review.objects.filter(
                reviewer=user.pharmacy_profile
            ).select_related('order')

        if user.role == 'DISTRIBUTOR':
            return Review.objects.filter(
                order__distributor=user.distributor_profile
            ).select_related('order')

        return Review.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != 'PHARMACY':
            raise PermissionDenied("Only pharmacies can submit reviews.")
        serializer.save(reviewer=self.request.user.pharmacy_profile)

    def destroy(self, request, *args, **kwargs):
        raise PermissionDenied("Reviews cannot be deleted.")