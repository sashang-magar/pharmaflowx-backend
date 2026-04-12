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
    phone = models.CharField(max_length=15 , unique=True,null=True, blank=True)
    organization = models.CharField(max_length=255,null=True, blank=True)
    role = models.CharField(max_length=55 , choices=ROLE_CHOICES.choices , default=ROLE_CHOICES.PHARMACY)
    address = models.TextField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.role})"
    class Meta :
        ordering = ["-date_joined"]

class ManufacturerProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL , on_delete=models.CASCADE ,related_name="manufacturer_profile")
    license_expiry_date = models.DateField(null=True, blank=True)
    license_number = models.CharField(max_length=255,null=True, blank=True)     
    company_name = models.CharField(max_length=255,null=True, blank=True)
    trust_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    # Later in code while doing admin 
    # def __str__(self):
    #     return super().__str__()
       

class LabProfile(models.Model):
    class LAB_TYPE(models.TextChoices):
        GOVERNMENT = "GOVERNMENT", "Government"
        PRIVATE = "PRIVATE", "Private"
    user = models.OneToOneField(settings.AUTH_USER_MODEL , on_delete=models.CASCADE , related_name="lab_profile")
    accreditation_expiry_date = models.DateField(null=True, blank=True)
    accreditation_number = models.CharField(max_length=255,null=True, blank=True)
    lab_type = models.CharField(max_length=50 , choices=LAB_TYPE.choices,null=True, blank=True)
    testing_capabilities = models.TextField(blank=True )
    created_at = models.DateTimeField(auto_now_add=True)

class DistributorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL , on_delete=models.CASCADE,related_name="distributor_profile")
    license_number = models.CharField(max_length=255,null=True, blank=True)
    license_expiry_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class PharmacyProfile(models.Model):
    class PHARMACY_CHOICES(models.TextChoices):
        RETAIL = 'RETAIL' , 'Retail'
        HOSPITAL = "HOSPITAL", "Hospital"
    user = models.OneToOneField(settings.AUTH_USER_MODEL , on_delete=models.CASCADE,related_name="pharmacy_profile")
    license_number = models.CharField(max_length=255,null=True, blank=True)
    license_expiry_date = models.DateField(null=True, blank=True)
    pharmacy_type = models.CharField(max_length=50 , choices=PHARMACY_CHOICES.choices,null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class RegulatorProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL , on_delete=models.CASCADE ,related_name="regulator_profile") 
    department = models.CharField(max_length=255,null=True, blank=True)  
    created_at = models.DateTimeField(auto_now_add=True) 
