from django.urls import path
from .views import SignupView, LoginView
from . import views

urlpatterns = [
    path('', views.register, name='reg'),
    path('login/', views.login, name='log'),
    path('success/', views.success),
    path('fail/', views.fail),
    path('api/auth/signup/', SignupView.as_view(), name="signup"),
    path('api/auth/login/', LoginView.as_view(), name="login"),
]
