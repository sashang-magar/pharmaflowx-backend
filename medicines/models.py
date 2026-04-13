from django.db import models
from accounts.models import ManufacturerProfile

# Create your models here.
class Medicine(models.Model):
    class DOSAGE_CHOICE(models.TextChoices):
        TABLET = "TABLET", "Tablet"
        CAPSULE = "CAPSULE", "Capsule"
        SYRUP = "SYRUP", "Syrup"
        INHALER = "INHALER", "Inhaler"

    class UNIT_CHOICES(models.TextChoices):
        STRIP = "STRIP", "Strip"
        BOTTLE = "BOTTLE", "Bottle"
        VIAL = "VIAL", "Vial"
        BOX = "BOX", "Box"
        TUBE = "TUBE", "Tube"

    manufacturer = models.ForeignKey(ManufacturerProfile, on_delete=models.CASCADE , related_name= 'medicines')
    brand_name = models.CharField(max_length=255 , blank=True , null= True)
    description = models.TextField(blank=True , null= True)
    generic_name = models.CharField(max_length=255 , blank=True , null= True)
    composition = models.CharField(max_length=255 , blank=True , null= True)
    unit_type = models.CharField(max_length=50 , choices=UNIT_CHOICES.choices)
    dosage_form = models.CharField(max_length=50 , choices=DOSAGE_CHOICE.choice)
    strength = models.CharField(max_length=255 , blank=True , null= True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.generic_name
    
    class Meta:
        ordering = ['-created_at']

class Batch(models.Model):
    class BATCH_CHOICES(models.TextChoices):
            IN_PRODUCTION = "IN_PRODUCTION", "In Production"
            LAB_TESTING = "LAB_TESTING", "Lab Testing"
            APPROVED = "APPROVED", "Approved"
            REJECTED = "REJECTED", "Rejected"
            DISTRIBUTED = "DISTRIBUTED", "Distributed"

    medicine = models.ForeignKey(Medicine , on_delete=models.CASCADE , related_name='batches')
    manufacturer = models.ForeignKey(ManufacturerProfile , on_delete=models.CASCADE , related_name='batches')
    batch_number = models.CharField(max_length=255 ,unique=True , blank=True , null= True)
    manufacture_date = models.DateField()
    expiry_date = models.DateField()
    initial_quantity = models.PositiveIntegerField()
    current_quantity = models.PositiveIntegerField()
    mrp = models.DecimalField(max_digits=6 , decimal_places=2 ,blank=True , null=True)
    status = models.CharField(max_length=255 , choices=BATCH_CHOICES.choices) 
    created_at = models.DateTimeField(auto_now_add=True)  

    def __str__(self):
        return self.batch_number
    
    class Meta:
        ordering = ['-created_at']