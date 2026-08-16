from django.contrib import admin
from .models import Approval


@admin.register(Approval)
class ApprovalAdmin(admin.ModelAdmin):
    list_display = [
        'get_batch_number', 'get_medicine',
        'get_lab', 'regulator', 'status', 'approved_at', 'created_at'
    ]
    list_filter = ['status']
    search_fields = [
        'lab_report__batch__batch_number',
        'lab_report__batch__medicine__brand_name'
    ]
    readonly_fields = ['approved_at', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def get_batch_number(self, obj):
        return obj.lab_report.batch.batch_number
    get_batch_number.short_description = 'Batch'

    def get_medicine(self, obj):
        return obj.lab_report.batch.medicine.brand_name
    get_medicine.short_description = 'Medicine'

    def get_lab(self, obj):
        return obj.lab_report.lab.user.organization
    get_lab.short_description = 'Lab'