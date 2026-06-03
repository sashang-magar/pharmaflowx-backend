from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ApprovalView

router = DefaultRouter()
router.register('approvals', ApprovalView, basename='approval')

urlpatterns = [
    path('', include(router.urls)),
]