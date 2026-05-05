from django.db import models
from accounts.models import RegulatorProfile
from labs.models import LabReport

class Approval(models.Model):
    class STATUS(models.TextChoices):
        UNDER_REVIEW = 'UNDER_REVIEW' ,' Under Review'
        APPROVED = 'APPROVED' , 'Approved'
        REJECTED = 'REJECTED' , 'Rejected'
    lab_report = models.OneToOneField(LabReport , on_delete=models.CASCADE ,name='approval')
    regulator = models.ForeignKey(RegulatorProfile , on_delete=models.CASCADE , name='approvals')
    remarks = models.TextField(blank=True , null=True)
    status = models.CharField(max_length=50 , choices =STATUS.choices ,default=STATUS.UNDER_REVIEW)
    approved_at = models.DateTimeField(blank=True , null=True)
    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.status
    
    class Meta:
        ordering = ['-created_at']
