from rest_framework import permissions
from .models import User

class IsManufacturer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.ROLE_CHOICES.MANUFACTURER
    
class IsLab(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.ROLE_CHOICES.LAB
    
class IsDistributer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.ROLE_CHOICES.DISTRIBUTOR
    
class IsPharmacy(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.ROLE_CHOICES.PHARMACY
    
class IsRegulator(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == User.ROLE_CHOICES.REGULATOR