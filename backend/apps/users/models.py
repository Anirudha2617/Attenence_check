from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """
    Custom user model for Attendance App.
    Fields: id, username, email, password, created_at (inherited)
    """
    pass
