from django.db import models


class Scholarship(models.Model):
    name = models.CharField(max_length=100, null=False, blank=False)
    description = models.TextField(null=False, blank=False)
    link = models.CharField(max_length=100, null=False, blank=False)
    image = models.ImageField(upload_to='images/', null=False, blank=False)

    def __str__(self):
        return self.name

