from django.shortcuts import render

from .serializers import SignupSerializer
from rest_framework.views import APIView
from django.shortcuts import redirect

from rest_framework_simplejwt.tokens import RefreshToken

def register(request):
    return render(request, 'accounts/register.html')

def login(request):
    return render(request, 'accounts/login.html')

def success(request):
    return render(request, 'accounts/success.html')

def fail(request):
    return render(request, 'accounts/fail.html')

class SignupView(APIView):

    def post(self, request):

        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.save()

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            response = redirect("/success")
            response.set_cookie("accessToken", access_token)

            return response

        return redirect("/fail")
    