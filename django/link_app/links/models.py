from django.db import models
from django.utils import timezone

class Link(models.Model):
    url = models.URLField(unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    keywords = models.JSONField(default=list)
    image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
