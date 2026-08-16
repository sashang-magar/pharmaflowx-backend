from django.contrib import admin
from . models import Medicine , Batch

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['brand_name', 'generic_name', 'strength',
                    'dosage_form', 'unit_type', 'manufacturer']
    search_fields = ['brand_name', 'generic_name']
    list_filter = ['dosage_form', 'unit_type']

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = [
        'batch_number',
        'medicine',
        'manufacturer',
        'status',
        'expiry_date',
        'current_quantity',
        'mrp',
    ]
    search_fields = ['batch_number', 'medicine__brand_name']
    list_filter = ['status']
    ordering = ['-created_at']   

