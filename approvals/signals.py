from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Approval
from medicines.models import Batch

@receiver(post_save , sender=Approval)
def sync_batch_and_approval(sender , instance , **kwargs):
    self