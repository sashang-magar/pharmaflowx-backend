from rest_framework import serializers
from .models import Inventory
from medicines.models import Batch

class InventorySerializer(serializers.ModelSerializer):

    batch_number = serializers.CharField(
        source='batch.batch_number', read_only=True
    )
    medicine_name = serializers.CharField(
        source='batch.medicine.brand_name', read_only=True
    )
    expiry_date = serializers.DateField(
        source='batch.expiry_date', read_only=True
    )
    mrp = serializers.DecimalField(
        source='batch.mrp', max_digits=6, decimal_places=2, read_only=True
    )
    distributor_name = serializers.CharField(
        source='distributor.user.organization', read_only=True
    )
    # computed field — available = quantity - reserved
    available_quantity = serializers.SerializerMethodField()
    class Meta:
        model = Inventory
        fields = ['id' ,'batch' , 'batch_number' , 'medicine_name', 'expiry_date', 'mrp', 'distributor_name',
                  'location' , 'reorder_threshold' , 'quantity' , 'reserved_quantity' , 'available_quantity', 'last_updated' , 'created_at']
        read_only_fields = [
            'id', 'distributor_name', 'last_updated', 'created_at'
        ]

    def get_available_quantity(self, obj):
        return obj.quantity - obj.reserved_quantity

    def validate_batch(self, batch):
        # EXTRA rule: only APPROVED batches can enter inventory
        if batch.status != Batch.BATCH_CHOICES.APPROVED:
            raise serializers.ValidationError(
                f"Batch status is '{batch.status}'. "
                "Only APPROVED batches can be added to inventory."
            )
        return batch

    def validate(self, attrs):
        quantity = attrs.get('quantity')
        reserved_quantity = attrs.get('reserved_quantity', 0)

        if reserved_quantity and quantity:
            if reserved_quantity > quantity:
                raise serializers.ValidationError(
                    "Reserved quantity cannot exceed total quantity."
                )
        return attrs    