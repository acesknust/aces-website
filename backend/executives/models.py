from django.db import models
from django.utils.translation import gettext_lazy as _

class AcademicYear(models.Model):
    name = models.CharField(max_length=50, unique=True, help_text=_("e.g., 2024-2025"))
    hero_banner = models.ImageField(
        upload_to='executives/banners/', 
        blank=True, 
        null=True,
        help_text=_("Hero banner for the Executives page.")
    )
    group_photo = models.ImageField(
        upload_to='executives/group_photos/', 
        blank=True, 
        null=True,
        help_text=_("Group photo displayed on the About page.")
    )
    description = models.TextField(
        blank=True, 
        help_text=_("Optional welcome message from the executives.")
    )
    show_description = models.BooleanField(
        default=True,
        help_text=_("Uncheck to hide the description on the frontend.")
    )
    is_current = models.BooleanField(
        default=False,
        help_text=_("Set this to true to make this the default active year.")
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-name']
        verbose_name = "Academic Year"
        verbose_name_plural = "Academic Years"

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Ensure only one year is marked as current at a time
        if self.is_current:
            AcademicYear.objects.exclude(pk=self.pk).update(is_current=False)
        super().save(*args, **kwargs)

class Executive(models.Model):
    # Position choices with built-in ordering (lower number = higher rank)
    POSITION_CHOICES = [
        ('president', 'President'),
        ('vice_president', 'Vice President'),
        ('general_secretary', 'General Secretary'),
        ('financial_secretary', 'Financial Secretary'),
        ('organizing_secretary', 'Organizing Secretary'),
        ('pro', 'Public Relations Officer'),
        ('womens_commissioner', "Women's Commissioner"),
    ]
    
    # Automatic ordering based on position
    POSITION_ORDER = {
        'president': 1,
        'vice_president': 2,
        'general_secretary': 3,
        'financial_secretary': 4,
        'organizing_secretary': 5,
        'pro': 6,
        'womens_commissioner': 7,
    }

    academic_year = models.ForeignKey(
        AcademicYear, 
        on_delete=models.CASCADE, 
        related_name='executives'
    )
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=50, choices=POSITION_CHOICES)
    image = models.ImageField(upload_to='executives/profiles/')
    
    class Meta:
        ordering = ['academic_year', 'position']  # Will use POSITION_ORDER in view
        verbose_name = "Executive"
        verbose_name_plural = "Executives"

    def __str__(self):
        return f"{self.name} ({self.get_position_display()}) - {self.academic_year.name}"

    @property
    def sort_order(self):
        """Returns the numeric order for this position"""
        return self.POSITION_ORDER.get(self.position, 99)


class SocialLink(models.Model):
    PLATFORM_CHOICES = [
        ('linkedin', 'LinkedIn'),
        ('twitter', 'Twitter'),
        ('instagram', 'Instagram'),
        ('facebook', 'Facebook'),
        ('email', 'Email'),
        ('website', 'Website'),
        ('whatsapp', 'WhatsApp'),
        ('telegram', 'Telegram'),
        ('other', 'Other'),
    ]
    
    executive = models.ForeignKey(Executive, related_name='social_links', on_delete=models.CASCADE)
    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    url = models.CharField(max_length=255, help_text="URL or Email Address")
    is_visible = models.BooleanField(default=True, help_text="Uncheck to hide this link on the website")
    
    def __str__(self):
        return f"{self.platform} - {self.url}"



