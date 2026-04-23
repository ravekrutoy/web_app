from rest_framework import serializers
from .models import User
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