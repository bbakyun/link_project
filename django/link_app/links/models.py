from django.db import models

# Create your models here.
class Link(models.Model):
    url = models.URLField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    keywords = models.JSONField(default=list)
    summary = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.title