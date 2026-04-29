from django.contrib import admin
from .models import User, Tasks

admin.site.register(User)
admin.site.register(Tasks)