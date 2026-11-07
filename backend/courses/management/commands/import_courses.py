import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from courses.models import AcademicYear, Semester, Course

class Command(BaseCommand):
    help = 'Imports courses from the existing JSON file'

    def handle(self, *args, **options):
        # Path to the JSON file
        json_path = os.path.join(settings.BASE_DIR.parent, 'frontend', 'public', 'data', 'aces_courses.json')
        
        self.stdout.write(f"Reading courses from: {json_path}")
        
        if not os.path.exists(json_path):
            self.stdout.write(self.style.ERROR(f"File not found: {json_path}"))
            return

        try:
            with open(json_path, 'r') as f:
                data = json.load(f)
                
            years_data = data.get('years', [])
            
            # Clear existing data? Uncomment to wipe before import
            # AcademicYear.objects.all().delete()
            
            created_courses = 0
            
            for year_item in years_data:
                year_num = year_item['year']
                
                # Create Academic Year
                year_obj, created = AcademicYear.objects.get_or_create(
                    year=year_num,
                    defaults={
                        'year_name': self.get_year_name(year_num)
                    }
                )
                
                status = "Created" if created else "Found"
                self.stdout.write(f"{status} Year {year_num}")
                
                for semester_item in year_item.get('semesters', []):
                    semester_num = semester_item['semester']
                    
                    # Create Semester
                    sem_obj, created = Semester.objects.get_or_create(
                        academic_year=year_obj,
                        semester_number=semester_num,
                        defaults={
                            'semester_name': self.get_semester_name(semester_num)
                        }
                    )
                    
                    # Create Courses
                    courses_list = semester_item.get('courses', [])
                    for idx, course_item in enumerate(courses_list):
                        # Clean resource URL if null
                        resource_url = course_item.get('resource_url') or ""
                        
                        Course.objects.get_or_create(
                            semester=sem_obj,
                            name=course_item['name'],
                            defaults={
                                'code': course_item.get('code'),
                                'resource_url': resource_url,
                                'credits': course_item.get('credits', 3), # Default to 3 credits
                                'description': course_item.get('description', ''),
                                'sort_order': idx
                            }
                        )
                        created_courses += 1
            
            self.stdout.write(self.style.SUCCESS(f"Successfully imported {created_courses} courses across {len(years_data)} years"))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error importing courses: {str(e)}"))

    def get_year_name(self, year):
        names = {1: "Freshman", 2: "Sophomore", 3: "Junior", 4: "Senior"}
        return names.get(year, "")

    def get_semester_name(self, semester):
        names = {1: "First Semester", 2: "Second Semester"}
        return names.get(semester, f"Semester {semester}")
