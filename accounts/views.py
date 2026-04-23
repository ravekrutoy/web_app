from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import redirect, render
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken

from .serializers import LoginSerializer, SignupSerializer

User = get_user_model()


def _set_access_cookie(response, access_token):
    max_age = int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())
    response.set_cookie(
        "accessToken",
        access_token,
        max_age=max_age,
        httponly=True,
        samesite="Lax",
        secure=not settings.DEBUG,
        path="/",
    )


def _clear_access_cookie(response):
    response.delete_cookie("accessToken", path="/", samesite="Lax")


def register(request):
    return render(request, "accounts/register.html")


def login_view(request):
    return render(request, "accounts/login.html")


def fail(request):
    return render(request, "accounts/fail.html")


class SignupView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            response = redirect("home")
            _set_access_cookie(response, access_token)
            return response

        return render(request, "accounts/register.html", {"errors": serializer.errors})


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return render(
                request,
                "accounts/login.html",
                {"error": "Invalid email or password"},
            )

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        user = authenticate(request, username=email, password=password)

        if user is None:
            return render(
                request,
                "accounts/login.html",
                {"error": "Invalid email or password"},
            )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        response = redirect("home")
        _set_access_cookie(response, access_token)
        return response


class LogoutView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        response = redirect("log")
        _clear_access_cookie(response)
        return response


class HomeView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        token = request.COOKIES.get("accessToken")

        if not token:
            return redirect("log")

        try:
            validated = AccessToken(token)
            user_id = validated["user_id"]
        except TokenError:
            response = redirect("log")
            _clear_access_cookie(response)
            return response

        if not User.objects.filter(pk=user_id, is_active=True).exists():
            response = redirect("log")
            _clear_access_cookie(response)
            return response

        filter_type = request.GET.get("filter", "all")
        return render(request, "accounts/home.html", {"filter": filter_type})
