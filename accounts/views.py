from django.shortcuts import render
import bcrypt

from .models import User, Tasks

from .serializers import SignupSerializer, LoginSerializer, TaskSerializer, TaskStatusSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import redirect
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie

from rest_framework_simplejwt.tokens import RefreshToken

def register(request):
    return render(request, 'accounts/register.html')

def login_view(request):
    return render(request, 'accounts/login.html')


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

    @method_decorator(ensure_csrf_cookie)
    def get(self, request):
        token = request.COOKIES.get("accessToken")

        if not token:
            return redirect("log")

        filter_type = request.GET.get("filter", "all")

        context = {
            "filter": filter_type
        }

        return render(request, "accounts/home.html", context)

class TaskView(APIView):
    def get(self, request):
        status_filter = request.GET.get("status", "all")
        if status_filter not in ["all", "active", "completed"]:
            return Response(
                {"error": "status must be one of: all, active, completed"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = Tasks.objects.all().order_by("-created_at")
        if status_filter != "all":
            queryset = queryset.filter(status=status_filter)

        serializer = TaskSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = TaskSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskStatusView(APIView):
    def patch(self, request, task_id):
        try:
            task = Tasks.objects.get(id=task_id)
        except Tasks.DoesNotExist:
            return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = TaskStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        task.status = serializer.validated_data["status"]
        task.save(update_fields=["status"])

        return Response(TaskSerializer(task).data, status=status.HTTP_200_OK)