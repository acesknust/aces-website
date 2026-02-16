from django.db import models


class Scholarship(models.Model):
    """
    Simplified Scholarship model.
    Basic fields for scholarship information with a link to apply.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('upcoming', 'Upcoming'),
    ]

    # Basic Information
    name = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to="images/scholarships", null=True, blank=True)
    
    # Link to scholarship application/details
    link = models.URLField(max_length=500, blank=True, help_text="Link to scholarship application or more info")
    
    # Eligibility
    eligibility = models.TextField(
        blank=True,
        help_text="Eligibility criteria (e.g., '1st year, 2nd year students')"
    )
    
    # Deadline - Using DateField for calendar picker
    deadline = models.DateField(
        null=True, 
        blank=True,
        help_text="Select the deadline date"
    )
    
    # Status and Metadata
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    last_updated = models.DateField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-last_updated']

    def __str__(self):
        return self.name