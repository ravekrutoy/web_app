from django.db import models

class User(models.Model):
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)

class Tasks(models.Model):
    STATUS_CHOICES = [
        ("active", "active"),
        ("completed", "completed"),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField()
    resource_url = models.URLField(max_length=200)
    deadline = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")
    created_at = models.DateTimeField(auto_now_add=True)    



