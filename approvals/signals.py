from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

from labs.models import LabReport
from .models import Approval
from medicines.models import Batch

@receiver(post_save , sender=Approval)
def sync_batch_and_approval(sender , instance , **kwargs):
    batch = instance.lab_report.batch

    if instance.status == Approval.STATUS.APPROVED:
        #sync batch
        Batch.objects.filter(pk=batch.pk).update(status = Batch.BATCH_CHOICES.APPROVED)
        #approved_at time
        Approval.objects.filter(pk=instance.pk).update(approved_at = timezone.now())
        #lab report as reviewed
        LabReport.objects.filter(pk = instance.lab_report.pk).update(report_status = LabReport.LAB_STATUS.REVIEWED)

    elif instance.status == Approval.STATUS.REJECTED:
        Batch.objects.filter(pk= batch.pk).update(status = Batch.BATCH_CHOICES.REJECTED)

        Approval.objects.filter(pk=instance.pk).update(approved_at = timezone.now())

        LabReport.objects.filter(pk = instance.lab_report.pk).update(report_status = LabReport.LAB_STATUS.REVIEWED)   