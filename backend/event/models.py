from django.db import models

class Event(models.Model):
    name = models.CharField(max_length=100, null=False, blank=False)
    date = models.CharField(max_length=100, null=False, blank=False)
    time = models.CharField(max_length=100, null=False, blank=False)
    location = models.CharField(max_length=100, null=False, blank=False)
    status = models.CharField(max_length=100, null=False, blank=False,
            choices=[
            ('Upcoming', 'Upcoming'),
            ('Completed', 'Completed'),
        ],
        default='Upcoming')
    image = models.FileField(upload_to="images/events", null=False, blank=False)

    def __str__(self):
        return self.name