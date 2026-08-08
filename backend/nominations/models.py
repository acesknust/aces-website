from django.db import models

class Category(models.Model):
    group_name = models.CharField(
        max_length=255,
        help_text="Parent category group (e.g. Icons and leadership)"
    )
    name = models.CharField(
        max_length=255,
        unique=True,
        help_text="Specific award title (e.g. Student of the Year)"
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Only active categories appear on the public form"
    )

    class Meta:
        ordering = ['group_name', 'name']
        verbose_name_plural = "Categories"

    def __str__(self):
        return f"{self.group_name} - {self.name}"


class NominationSettings(models.Model):
    is_open = models.BooleanField(
        default=False,
        help_text="Toggle to open/close public award nominations"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Nomination Settings"
        verbose_name_plural = "Nomination Settings"

    def __str__(self):
        state = "OPEN" if self.is_open else "CLOSED"
        return f"Nomination Settings — Nominations are {state}"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get_settings(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class Nomination(models.Model):
    nominee_name = models.CharField(max_length=255)
    nominee_name_normalized = models.CharField(
        max_length=255,
        db_index=True,
        editable=False
    )
    nominee_whatsapp = models.CharField(max_length=50, help_text="Nominee WhatsApp Number", blank=True, null=True)
    nominee_phone = models.CharField(max_length=50, blank=True, null=True)
    nominee_email = models.EmailField(blank=True, null=True)
    nominee_photo = models.ImageField(upload_to='nominations/nominees/', blank=True, null=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='nominations'
    )
    nominator_name = models.CharField(max_length=255, blank=True, null=True)
    nominator_phone = models.CharField(max_length=50, blank=True, null=True)
    nominator_email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['category', 'nominee_name_normalized'],
                name='unique_category_nominee'
            )
        ]

    def save(self, *args, **kwargs):
        if self.nominee_name:
            self.nominee_name_normalized = " ".join(self.nominee_name.strip().split()).lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nominee_name} ({self.category.name}) - Nominated by {self.nominator_name}"
