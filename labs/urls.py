from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LabReportView

router = DefaultRouter()

router.register('labreports/' , LabReportView , basename='labreport')

urlpatterns = [
    path('' , include(router.urls))
]