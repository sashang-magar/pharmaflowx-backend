from django.contrib import admin
from . models import LabReport

@admin.register(LabReport)
class LabReportAdmin(admin.ModelAdmin):
    list_display = ['batch' ,'lab' , 'result','report_status' ]

