from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import ManufacturerProfile , LabProfile , DistributorProfile, PharmacyProfile, RegulatorProfile

@receiver(post_save , sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender , instance , created , **kwargs):
    if created:
        if instance.role == 'MANUFACTURER':
            ManufacturerProfile.objects.create(user = instance)
        elif instance.role == 'LAB':
            LabProfile.objects.create(user = instance)    
        elif instance.role == 'DISTRIBUTOR':
            DistributorProfile.objects.create(user = instance)    
        elif instance.role == 'PHARMACY':
            PharmacyProfile.objects.create(user = instance)    
        elif instance.role == 'REGULATOR':
            RegulatorProfile.objects.create(user = instance)    



