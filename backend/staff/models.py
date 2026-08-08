from django.db import models


class StaffMember(models.Model):
    """
    Department staff members (HOD, Patron, Lecturers, etc.)
    Managed via Django Admin.
    """
    name = models.CharField(max_length=200)
    position = models.CharField(max_length=200, help_text="e.g., Head of Department, ACES Patron")
    image = models.ImageField(upload_to='staff/', blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0, help_text="Lower numbers appear first")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name = "Staff Member"
        verbose_name_plural = "Staff Members"

    def __str__(self):
        return f"{self.name} - {self.position}"
