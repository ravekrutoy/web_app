from django.shortcuts import render
import bcrypt

from .models import User

from .serializers import SignupSerializer, LoginSerializer
from rest_framework.views import APIView
from django.shortcuts import redirect

from rest_framework_simplejwt.tokens import RefreshToken

def register(request):
    return render(request, 'accounts/register.html')

def login_view(request):
    return render(request, 'accounts/login.html')

def fail(request):
    return render(request, 'accounts/fail.html')



class SignupView(APIView):

    def post(self, request):
        
        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            
            user = serializer.save()

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            response = redirect("/home")
            response.set_cookie("accessToken", access_token)

            return response

        return render(request, "accounts/register.html", {"errors": serializer.errors})
    
class LoginView(APIView):

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return render(request, "accounts/login.html", {
                "error": "Invalid email or password"
            })

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return render(request, "accounts/login.html", {
                "error": "Invalid email or password"
            })

        if not bcrypt.checkpw(password.encode(), user.password.encode()):
            return render(request, "accounts/login.html", {
                "error": "Invalid email or password"
            })

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        response = redirect("home")
        response.set_cookie("accessToken", access_token)

        return response

class LogoutView(APIView):

    def get(self, request):
        response = redirect("log")
        response.delete_cookie("accessToken")
        return response
    
class HomeView(APIView):

    def get(self, request):
        token = request.COOKIES.get("accessToken")

        if not token:
            return redirect("log")

        return render(request, "accounts/home.html")