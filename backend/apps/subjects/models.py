from django.db import models
from django.conf import settings

class Subject(models.Model):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subjects')
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional: Visual customization like color
    color_hex = models.CharField(max_length=7, default="#3B82F6") # Default blue

    def __str__(self):
        return self.name
