from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    class ROLE_CHOICES(models.TextChoices):
        MANUFACTURER = 'MANUFACTURER' , 'Manufacturer'
        LAB = 'LAB' , 'Lab'
        REGULATOR = "REGULATOR", "Regulator"
        DISTRIBUTOR = "DISTRIBUTOR", "Distributor"
        PHARMACY = "PHARMACY", "Pharmacy"
        ADMIN = "ADMIN", "Admin"


    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15 , unique=True)
    organization = models.CharField(max_length=255)
    role = models.CharField(max_length=55 , choices=ROLE_CHOICES.choices)
    address = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
    class Meta :
        ordering = ["-date_joined"]

class ManufacturerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL , on_delete=models.CASCADE ,related_name="manufacturer_profile")
    license_expiry_date = models.DateField()
    license_number = models.CharField(max_length=255)        

class LabProfile(models.Model):
    class LAB_TYPE(models.TextChoices):
        GOVERNMENT = "GOV", "Government"
        PRIVATE = "PRIVATE", "Private"
    user = models.OneToOneField(settings.AUTH_USER_MODEL , on_delete=models.CASCADE , related_name="lab_profile")
    accreditation_expiry_date = models.DateField()
    accreditation_number = models.CharField(max_length=255)
    lab_type = models.CharField(max_length=50 , choices=LAB_TYPE.choices)
    testing_capabilities = models.TextField(blank=True )

class DistributorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL , on_delete=models.CASCADE,related_name="distributor_profile")
    license_number = models.CharField(max_length=255)
    license_expiry_date = models.DateField()

class PharmacyProfile(models.Model):
    class PHARMACY_CHOICES(models.TextChoices):
        RETAIL = 'Retail' , 'RETAIL'
        HOSPITAL = "HOSPITAL", "Hospital"
    user = models.OneToOneField(settings.AUTH_USER_MODEL , on_delete=models.CASCADE,related_name="pharmacy_profile")
    license_number = models.CharField(max_length=255)
    license_expiry_date = models.DateField()
    pharmacy_type = models.CharField(max_length=50 , choices=PHARMACY_CHOICES.choices)

class RegulatorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL , on_delete=models.CASCADE ,related_name="regulator_profile") 
    department = models.CharField(max_length=255)   
