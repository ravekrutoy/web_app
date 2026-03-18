from django.urls import path
from .views import SignupView, LoginView, LogoutView, HomeView
from . import views

urlpatterns = [
    path('', views.register, name='reg'),
    path('login/', views.login_view, name='log'),
    path('fail/', views.fail),
    path('home/', HomeView.as_view(), name='home'),
    path('api/auth/signup/', SignupView.as_view(), name="signup"),
    path('api/auth/login/', LoginView.as_view(), name="login"),
    path('logout/', LogoutView.as_view(), name="logout"),
]
