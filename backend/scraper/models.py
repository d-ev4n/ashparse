from django.db import models
from django.conf import settings


class ScrapeJob(models.Model):

    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    url = models.URLField()

    selectors = models.JSONField()

    results = models.JSONField(default=dict, blank=True)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.url