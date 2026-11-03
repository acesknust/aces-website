from django.conf import settings
from django.db import models
from django.utils import timezone


class AttendanceSession(models.Model):
    """One sitting where attendance is taken, e.g. a meeting or an event."""

    title = models.CharField(max_length=200)
    date = models.DateField(default=timezone.localdate)
    event = models.ForeignKey(
        'event.Event', null=True, blank=True, on_delete=models.SET_NULL, related_name='attendance_sessions'
    )
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='attendance_sessions'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} ({self.date})"


class AttendanceRecord(models.Model):
    STATUS_PRESENT = 'present'
    STATUS_LATE = 'late'
    STATUS_ABSENT = 'absent'
    STATUS_CHOICES = [
        (STATUS_PRESENT, 'Present'),
        (STATUS_LATE, 'Late'),
        (STATUS_ABSENT, 'Absent'),
    ]

    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='records')
    full_name = models.CharField(max_length=200)
    index_number = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=STATUS_PRESENT)
    note = models.CharField(max_length=255, blank=True)
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name='+'
    )
    marked_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['full_name']
        constraints = [
            models.UniqueConstraint(
                fields=['session', 'index_number'],
                condition=~models.Q(index_number=''),
                name='unique_index_number_per_session',
            ),
        ]

    def __str__(self):
        return f"{self.full_name} - {self.get_status_display()}"
