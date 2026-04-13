from django.urls import path
from .views import (RegisterView, LoginView , MeView , ManufacturerView ,
                     LabView , RegulatorView , PharmacyView , DistributerView)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('auth/token/refresh/' , TokenRefreshView.as_view() , name = 'token_refresh' ),
    path('auth/me/' , MeView.as_view() ),

    #For Profiles
    path('profiles/manufacturer/' ,ManufacturerView.as_view()),
    path('profiles/lab/' ,LabView.as_view()),
    path('profiles/regulator/' ,RegulatorView.as_view()),
    path('profiles/pharmacy/' ,PharmacyView.as_view()),
    path('profiles/distributer/' ,DistributerView.as_view()),
]