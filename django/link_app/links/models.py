from django.db import models
from django.utils import timezone
import uuid

class Link(models.Model):
    url = models.URLField()
    title = models.CharField(max_length=255)
    description = models.TextField()
    keywords = models.JSONField(default=list)
    image_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    user_uuid = models.CharField(max_length=36, default=uuid.uuid4)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user_uuid', 'url'], name='unique_user_link')
        ]
        
    def __str__(self):
        return self.title
