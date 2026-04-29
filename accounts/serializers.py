from rest_framework import serializers
from .models import User, Tasks
import bcrypt


class SignupSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["firstName", "lastName", "email", "password"]
        
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("There is already a user with this email")
        return value
    
    def create(self, validated_data):

        password = validated_data["password"]

        hashed_password = bcrypt.hashpw(
            password.encode(),
            bcrypt.gensalt()
        ).decode()

        validated_data["password"] = hashed_password

        return User.objects.create(**validated_data)
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class TaskSerializer(serializers.ModelSerializer):
    resource_url = serializers.URLField(required=True)
    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Tasks
        fields = ["id", "title", "description", "resource_url", "deadline", "status", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_title(self, value):
        cleaned_title = value.strip()
        if not cleaned_title:
            raise serializers.ValidationError("Title is required.")
        return cleaned_title


class TaskStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["active", "completed"])