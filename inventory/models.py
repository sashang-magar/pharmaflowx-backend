from django.db import models
from accounts.models import DistributorProfile
from medicines.models import Batch

class Inventory(models.Model):
    batch = models.ForeignKey(Batch , on_delete=models.CASCADE , related_name='inventory')
    distributor = models.ForeignKey(DistributorProfile , on_delete=models.CASCADE , related_name='inventory')
    quantity = models.PositiveIntegerField()
    reserved_quantity = models.PositiveIntegerField(default=0)
    location = models.CharField(max_length=255 , null=True , blank=True)
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    reorder_threshold = models.PositiveIntegerField(default=100)

    def __str__(self):
        return f"{self.distributor.user.organization} — {self.batch.batch_number} ({self.quantity})"

    class Meta:
        ordering = ['-created_at']
        