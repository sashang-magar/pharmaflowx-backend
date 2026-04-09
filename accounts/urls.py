from django.urls import path
from .views import RegisterView, LoginView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view()),
    path('auth/login/', LoginView.as_view()),
    path('token/refresh/' , TokenRefreshView.as_view() , name = 'token_refresh' ),
    path('auth/me/' , TokenRefreshView.as_view() ),
]