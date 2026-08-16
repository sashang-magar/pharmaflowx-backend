from django.contrib import admin 
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import (User, ManufacturerProfile, LabProfile,
                     DistributorProfile, PharmacyProfile, RegulatorProfile)

admin.site.site_header = "PharmaFlowX Admin"
admin.site.site_title = "PharmaFlowX"
admin.site.index_title = "PharmaFlowX Supply Chain"

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username','email' , 'phone' , 'organization' , 'role' ,'address']
    list_filter = ['role', 'is_active']
    search_fields = ['username', 'email', 'phone', 'organization']
    # adds your custom fields to the edit form
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('phone', 'organization', 'role', 'address')}),
    )

@admin.register(ManufacturerProfile)
class ManufacturerAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'user', 'license_number',
                    'license_expiry_date', 'trust_score']
    search_fields = ['company_name', 'license_number']

@admin.register(LabProfile)
class LabAdmin(admin.ModelAdmin):
    list_display = ['user', 'lab_type', 'accreditation_number', 'accreditation_expiry_date']
    list_filter = ['lab_type']  

@admin.register(DistributorProfile)
class DistributorAdmin(admin.ModelAdmin):
    list_display = ['user', 'license_number', 'license_expiry_date']

@admin.register(PharmacyProfile)
class PharmacyAdmin(admin.ModelAdmin):
    list_display = ['user', 'pharmacy_type', 'license_number', 'license_expiry_date']
    list_filter = ['pharmacy_type']  
@admin.register(RegulatorProfile)
class RegulatorAdmin(admin.ModelAdmin):
    list_display = ['user', 'department', 'created_at'] 