from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from . import models

@admin.register(models.User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email' , 'phone' , 'organization' , 'role' ,'address']

@admin.register(models.ManufacturerProfile)
class ManufacturerAdmin(admin.ModelAdmin):
    list_display = ['company_name']    

@admin.register(models.LabProfile)
class LabAdmin(admin.ModelAdmin):
    list_display = ['lab_type','testing_capabilities' ]   

@admin.register(models.DistributorProfile)
class DistributerAdmin(admin.ModelAdmin):
    list_display = ['license_number']    

@admin.register(models.PharmacyProfile)
class PharmacyAdmin(admin.ModelAdmin):
    list_display = ['pharmacy_type']    
@admin.register(models.RegulatorProfile)
class RegulatorAdmin(admin.ModelAdmin):
    list_display = ['department']    