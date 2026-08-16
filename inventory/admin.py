from django.contrib import admin
from django.utils import timezone
from datetime import timedelta
from .models import Inventory


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = [
        'get_medicine','get_batch', 'distributor',
        'quantity', 'reserved_quantity', 'get_available',
        'reorder_threshold','get_expiry', 'location', 'last_updated'
    ]
    list_filter = ['distributor', 'batch__medicine__dosage_form']
    search_fields = [
        'batch__batch_number',
        'batch__medicine__brand_name',
        'distributor__user__organization'
    ]
    readonly_fields = ['last_updated', 'created_at']
    ordering = ['batch__expiry_date']  


    def get_medicine(self, obj):
        return obj.batch.medicine.brand_name
    get_medicine.short_description = 'Medicine'

    def get_batch(self, obj):
        return obj.batch.batch_number
    get_batch.short_description = 'Batch'

    def get_available(self, obj):
        return obj.quantity - obj.reserved_quantity
    get_available.short_description = 'Available'

    def get_expiry(self, obj):
        expiry = obj.batch.expiry_date
        today = timezone.now().date()
        threshold = today + timedelta(days=30)

        if expiry <= today:
            return f"EXPIRED — {expiry}"
        if expiry <= threshold:
            return f"EXPIRING SOON — {expiry}"
        
        return str(expiry)
    
    get_expiry.short_description = 'Expiry'

    