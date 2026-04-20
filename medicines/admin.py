from django.contrib import admin
from . models import Medicine , Batch

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display  = ['brand_name' , 'description' , 'strength' , 'unit_type']

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ['manufacturer_date' , 'expiry_date' , 'initial_quantity' , 'current_quantity' , 'mrp']    

