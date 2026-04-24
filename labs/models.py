from django.db import models
from medicines.models import Batch 
from accounts.models import LabProfile 

class LabReport(models.Model):
    class LAB_STATUS(models.TextChoices):
        PENDING = 'PENDING' , 'Pending'
        SUBMITTED = 'SUBMITTED' , 'Submitted'
        REVIEWED = 'REVIEWED' , 'Reviewed'

    class RESULT_STATUS(models.TextChoices):
        PASS = 'PASS' , 'Pass'   
        FAIL = 'FAIL' , 'Fail'
        INCONCLUSIVE = 'INCONCLUSIVE' , 'Inconclusive'

    batch = models.ForeignKey(Batch, on_delete=models.CASCADE , related_name='lab_reports')
    lab = models.ForeignKey(LabProfile , on_delete=models.CASCADE , related_name = 'lab_reports' )
    remark = models.TextField(blank=True , null=True)
    result = models.CharField(max_length=50 , choices=RESULT_STATUS.choices)
    tested_at = models.DateTimeField(null=True, blank=True)
    report_status = models.CharField(max_length=50 , choices=LAB_STATUS.choices , default=LAB_STATUS.PENDING)
    report_files = models.FileField(upload_to='labs/lab_reports/%Y/%m/' , blank=True , null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.lab} - {self.result}' 
    
    class Meta:
        ordering = ['-created_at']

