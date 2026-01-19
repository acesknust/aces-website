from django.core.management.base import BaseCommand
from scholarship.models import Scholarship
import json

class Command(BaseCommand):
    help = 'Converts legacy JSON eligibility fields to simple text'

    def handle(self, *args, **options):
        count = 0
        for s in Scholarship.objects.all():
            if not s.eligibility:
                continue
                
            try:
                # Try to parse as JSON
                data = json.loads(s.eligibility)
                
                # If it's a list or dict, convert to pretty string
                text_parts = []
                
                if isinstance(data, dict):
                    if 'targetStudents' in data: 
                        text_parts.extend([str(x) for x in data['targetStudents']])
                    if 'yearLevels' in data: 
                        text_parts.extend([str(x) for x in data['yearLevels']])
                    if 'minimumGrade' in data: 
                        text_parts.append(f"Min Grade: {data['minimumGrade']}")
                    if 'programType' in data:
                        text_parts.extend([str(x) for x in data['programType']])
                    if 'nationality' in data:
                        text_parts.extend([str(x) for x in data['nationality']])
                        
                    # If dict but no known keys, just dump values
                    if not text_parts:
                        text_parts = [str(v) for v in data.values() if isinstance(v, (str, int))]
                        
                elif isinstance(data, list):
                    text_parts = [str(x) for x in data]
                
                if text_parts:
                    new_text = ", ".join(text_parts)
                    if len(new_text) > 0:
                        s.eligibility = new_text
                        s.save()
                        count += 1
                        self.stdout.write(self.style.SUCCESS(f'Converted "{s.name}" to text: {new_text}'))
                        
            except json.JSONDecodeError:
                # Already text, ignore
                continue
                
        self.stdout.write(self.style.SUCCESS(f'Successfully converted {count} scholarships to plain text eligibility.'))
