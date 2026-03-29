from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class ROLE_CHOICES(models.TextChoices):
        MANUFACTURER = 'MANUFACTURER' , 'Manufacturer'
        LAB = 'LAB' , 'Lab'
        REGULATOR = "REGULATOR", "Regulator"
        DISTRIBUTOR = "DISTRIBUTOR", "Distributor"
        PHARMACY = "PHARMACY", "Pharmacy"
        ADMIN = "ADMIN", "Admin"


    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=10 , unique=True)
    name = models.CharField(max_length= 255)
    organization = models.CharField(max_length=255)
    role = models.CharField(max_length=55 , choices=ROLE_CHOICES.choices)
    address = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    
    
