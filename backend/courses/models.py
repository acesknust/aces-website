from django.db import models

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
    resource_url = models.URLField(max_length=500, help_text="Link to Google Drive or Firebase resource")
    credits = models.IntegerField(blank=True, null=True, help_text="Credit hours for this course")
    description = models.TextField(blank=True, null=True, help_text="Brief description of the course content")
    sort_order = models.IntegerField(default=0, help_text="Order to display in the list")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['semester', 'sort_order', 'name']

    def __str__(self):
        return f"{self.code} - {self.name}" if self.code else self.name
