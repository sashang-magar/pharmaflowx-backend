from rest_framework import serializers
from .models import Order, OrderItem, Review
from inventory.models import Inventory


class OrderItemInputSerializer(serializers.Serializer):
    """Used only for validating incoming items on order creation."""
    inventory = serializers.PrimaryKeyRelatedField(
        queryset=Inventory.objects.all()
    )
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)


class OrderItemSerializer(serializers.ModelSerializer):
    batch_number = serializers.CharField(
        source='batch.batch_number', read_only=True
    )
    medicine_name = serializers.CharField(
        source='batch.medicine.brand_name', read_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            'id', 'inventory', 'batch', 'batch_number',
            'medicine_name', 'quantity', 'unit_price', 'total_price'
        ]
        read_only_fields = ['id', 'batch', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    pharmacy_name = serializers.CharField(
        source='pharmacy.user.organization', read_only=True
    )
    distributor_name = serializers.CharField(
        source='distributor.user.organization', read_only=True
    )

    class Meta:
        model = Order
        fields = [
            'id', 'pharmacy', 'pharmacy_name',
            'distributor', 'distributor_name',
            'items', 'status', 'payment_method', 'payment_status',
            'ordered_at', 'delivered_at', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'pharmacy_name', 'distributor_name', 'status',
            'ordered_at', 'delivered_at', 'created_at', 'updated_at'
        ]


class OrderCreateSerializer(serializers.Serializer):
    """
    Separate serializer for order creation.
    Keeps create logic clean and separate from read logic.
    """
    distributor = serializers.PrimaryKeyRelatedField(
        queryset=__import__(
            'accounts.models', fromlist=['DistributorProfile']
        ).DistributorProfile.objects.all()
    )
    payment_method = serializers.ChoiceField(
        choices=Order.PAYMENT_METHOD.choices,
        default=Order.PAYMENT_METHOD.CASH
    )
    items = OrderItemInputSerializer(many=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError(
                "Order must contain at least one item."
            )
        return items


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    """Distributor uses this to update status and payment_status only."""
    class Meta:
        model = Order
        fields = ['id', 'status', 'payment_status']


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.CharField(
        source='reviewer.user.organization', read_only=True
    )

    class Meta:
        model = Review
        fields = [
            'id', 'order', 'reviewer_name',
            'rating', 'comment', 'created_at'
        ]
        read_only_fields = ['id', 'reviewer_name', 'created_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )
        return value

    def validate_order(self, order):
        # only after delivery
        if order.status != Order.STATUS.DELIVERED:
            raise serializers.ValidationError(
                "Review can only be submitted after order is DELIVERED."
            )
        # no duplicate reviews
        if hasattr(order, 'review') and self.instance is None:
            raise serializers.ValidationError(
                "A review already exists for this order."
            )
        return order