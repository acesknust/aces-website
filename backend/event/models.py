from django.db import models
from django.utils.text import slugify

from django.utils import timezone

class Event(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField(blank=True, help_text="Full event details")
    
    date = models.DateField(help_text="Date of the event")
    time = models.TimeField(help_text="Time of the event")
    location = models.CharField(max_length=200)
    location_url = models.URLField(max_length=500, blank=True, help_text="Google Maps link for the venue")
    
    image = models.ImageField(upload_to="events/", help_text="Event banner image")
    
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-time']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def status(self):
        from django.utils import timezone
        now = timezone.now().date()
        if self.date < now:
            return 'Completed'
        return 'Upcoming'