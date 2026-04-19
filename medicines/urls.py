from django.urls import path , include
from .views import MedicineViewSet , BatchViewSet
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register('medicines',MedicineViewSet , basename='medicines')
router.register('batches',BatchViewSet , basename='batches')

urlpatterns  = [
    path('' ,include(router.urls))
]