from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApprovalViewSet

router = DefaultRouter()
router.register('approvals', ApprovalViewSet, basename='approval')

urlpatterns = [
    path('', include(router.urls)),
]