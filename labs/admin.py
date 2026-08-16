from django.contrib import admin
from . models import LabReport

@admin.register(LabReport)
class LabReportAdmin(admin.ModelAdmin):
    list_display = ['batch' ,'lab' , 'result','report_status', 'tested_at', 'created_at' ]
    list_filter = ['result', 'report_status']
    search_fields = ['batch__batch_number', 'lab__user__organization']
    ordering = ['-created_at']
