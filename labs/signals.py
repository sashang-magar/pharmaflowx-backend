from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import LabReport
from medicines.models import Batch

@receiver(post_save , sender=LabReport)
def update_status_of_batch_report(sender , instance , created , **kwargs):
    if created:
        if instance.batch.status == Batch.BATCH_CHOICES.LAB_TESTING:
            LabReport.objects.filter(pk = instance.pk).update(
                report_status = LabReport.LAB_STATUS.SUBMITTED
            )
