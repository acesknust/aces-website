from django.db import models
from .validators import validate_resource_file


class AcademicYear(models.Model):
    year = models.IntegerField(primary_key=True, help_text="Academic Year (e.g. 1, 2, 3, 4)")
    year_name = models.CharField(max_length=50, blank=True, null=True, help_text="Optional name (e.g. 'Freshman', 'Sophomore')")
    is_active = models.BooleanField(default=True, help_text="Uncheck to hide this year from the frontend")
    
    class Meta:
        ordering = ['year']

    def __str__(self):
        return f"Year {self.year}" + (f" - {self.year_name}" if self.year_name else "")

class Semester(models.Model):
    academic_year = models.ForeignKey(AcademicYear, related_name='semesters', on_delete=models.CASCADE)
    semester_number = models.IntegerField(help_text="1 for First Semester, 2 for Second Semester")
    semester_name = models.CharField(max_length=50, blank=True, null=True, help_text="Optional name")
    
    class Meta:
        ordering = ['academic_year', 'semester_number']
        unique_together = ['academic_year', 'semester_number']

    def __str__(self):
        return f"Year {self.academic_year.year} - Semester {self.semester_number}"

class Course(models.Model):
    semester = models.ForeignKey(Semester, related_name='courses', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, blank=True, null=True, help_text="Course code (e.g. COE 252)")
    resource_url = models.URLField(
        max_length=500, blank=True, null=True,
        help_text="Legacy link (Google Drive / Firebase). Use Course Resources below for new uploads."
    )
    credits = models.IntegerField(blank=True, null=True, help_text="Credit hours for this course")
    description = models.TextField(blank=True, null=True, help_text="Brief description of the course content")
    sort_order = models.IntegerField(default=0, help_text="Order to display in the list")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['semester', 'sort_order', 'name']

    def __str__(self):
        return f"{self.code} - {self.name}" if self.code else self.name


class CourseResource(models.Model):
    """
    Individual downloadable resource attached to a course.
    Supports EITHER an uploaded file (Cloudflare R2 / S3) OR an external URL.
    One course can have many resources (slides, past exams, tutorials, etc.).
    """
    RESOURCE_TYPES = [
        ('slides', 'Lecture Slides'),
        ('past_exam', 'Past Exam'),
        ('tutorial', 'Tutorial Sheet'),
        ('lab_manual', 'Lab Manual'),
        ('assignment', 'Assignment'),
        ('textbook', 'Textbook / Reference'),
        ('project', 'Project Files'),
        ('other', 'Other'),
    ]

    course = models.ForeignKey(
        Course, related_name='resources', on_delete=models.CASCADE
    )
    title = models.CharField(
        max_length=200,
        help_text="e.g., 'Week 1-4 Slides', '2024 Final Exam', 'Lab Manual'"
    )
    resource_type = models.CharField(
        max_length=20, choices=RESOURCE_TYPES, default='slides'
    )

    # --- Hybrid: file upload OR external link (at least one required) ---
    file = models.FileField(
        upload_to='courses/%Y/',
        blank=True, null=True,
        validators=[validate_resource_file],
        help_text="Upload a file (PDF, PPTX, ZIP, etc.) — max 100MB"
    )
    external_url = models.URLField(
        max_length=500, blank=True, null=True,
        help_text="OR paste a Google Drive / Firebase / external link"
    )

    # --- Auto-populated metadata ---
    file_size = models.PositiveBigIntegerField(
        null=True, blank=True,
        help_text="File size in bytes (auto-calculated on upload)"
    )
    file_extension = models.CharField(
        max_length=10, blank=True,
        help_text="Auto-detected file extension (pdf, pptx, zip, etc.)"
    )

    # --- Tracking & visibility ---
    download_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True, help_text="Uncheck to hide from students")
    sort_order = models.IntegerField(default=0, help_text="Order within the course")

    # --- Timestamps ---
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['resource_type', 'sort_order', '-created_at']
        verbose_name = "Course Resource"
        verbose_name_plural = "Course Resources"

    def __str__(self):
        prefix = self.course.code or self.course.name
        return f"{prefix} — {self.title}"

    def clean(self):
        """Ensure at least one of file or external_url is provided."""
        from django.core.exceptions import ValidationError
        if not self.file and not self.external_url:
            raise ValidationError(
                "You must provide either a file upload or an external URL."
            )

    def save(self, *args, **kwargs):
        # Auto-populate file metadata on upload
        if self.file:
            try:
                self.file_size = self.file.size
            except Exception:
                pass
            name = self.file.name or ''
            if '.' in name:
                self.file_extension = name.rsplit('.', 1)[-1].lower()
        elif self.external_url:
            # Try to detect extension from URL
            url_path = self.external_url.split('?')[0]  # strip query params
            if '.' in url_path:
                ext = url_path.rsplit('.', 1)[-1].lower()
                if len(ext) <= 10 and ext in ('pdf', 'zip', 'rar', 'pptx', 'docx', '7z'):
                    self.file_extension = ext
        super().save(*args, **kwargs)

    @property
    def download_url(self):
        """Return the best available URL for downloading."""
        if self.file:
            return self.file.url
        return self.external_url or ''

