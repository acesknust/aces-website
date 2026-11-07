from django.db import models


class WebhookLog(models.Model):
    """
    Immutable audit log of every incoming webhook request.
    These records should NEVER be deleted — they are your financial audit trail.
    """
    id = models.AutoField(primary_key=True)
    provider = models.CharField(max_length=50, default='paystack')
    event_type = models.CharField(max_length=100, blank=True, default='')
    reference = models.CharField(max_length=100, blank=True, default='', db_index=True)
    payload = models.JSONField()
    headers = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='received', choices=[
        ('received', 'Received'),
        ('processed', 'Processed'),
        ('failed', 'Processing Failed'),
        ('ignored', 'Ignored')
    ])
    processing_error = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            # reference already has db_index=True (removed duplicate)
            models.Index(fields=['created_at']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.provider} - {self.event_type} - {self.reference}"
