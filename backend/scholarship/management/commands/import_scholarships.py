"""
Management command to import scholarships from the legacy JSON file.
Usage: python manage.py import_scholarships
"""
import json
from pathlib import Path
from datetime import datetime
from django.core.management.base import BaseCommand
from scholarship.models import Scholarship


class Command(BaseCommand):
    help = 'Import scholarships from the frontend JSON file'

    def add_arguments(self, parser):
        parser.add_argument(
            '--json-file',
            type=str,
            default=None,
            help='Path to the scholarshipData.json file (default: auto-detect)'
        )

    def handle(self, *args, **options):
        # Find the JSON file
        json_path = options['json_file']
        if not json_path:
            # Auto-detect: look in frontend/public/data/
            base_path = Path(__file__).resolve().parent.parent.parent.parent.parent
            json_path = base_path / 'frontend' / 'public' / 'data' / 'scholarshipData.json'
        
        if not Path(json_path).exists():
            self.stderr.write(self.style.ERROR(f'JSON file not found: {json_path}'))
            return

        self.stdout.write(f'Reading from: {json_path}')

        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        scholarships = data.get('Scholarship', [])
        self.stdout.write(f'Found {len(scholarships)} scholarships to import')

        created_count = 0
        updated_count = 0

        for item in scholarships:
            # Parse the lastUpdated date
            last_updated = None
            if item.get('lastUpdated'):
                try:
                    last_updated = datetime.strptime(item['lastUpdated'], '%Y-%m-%d').date()
                except ValueError:
                    last_updated = None

            # Check if scholarship already exists (by name and provider)
            existing = Scholarship.objects.filter(
                name=item.get('name', ''),
                provider=item.get('provider', '')
            ).first()

            scholarship_data = {
                'name': item.get('name', ''),
                'provider': item.get('provider', ''),
                'description': item.get('description', ''),
                'eligibility': item.get('eligibility', {}),
                'benefits': item.get('benefits', {}),
                'requirements': item.get('requirements', {}),
                'application_process': item.get('applicationProcess', {}),
                'deadlines': item.get('deadlines', {}),
                'contact': item.get('contact', {}),
                'status': item.get('status', 'active'),
            }

            if existing:
                # Update existing scholarship
                for key, value in scholarship_data.items():
                    setattr(existing, key, value)
                existing.save()
                updated_count += 1
                self.stdout.write(f'  Updated: {existing.name}')
            else:
                # Create new scholarship
                scholarship = Scholarship.objects.create(**scholarship_data)
                created_count += 1
                self.stdout.write(f'  Created: {scholarship.name}')

        self.stdout.write(self.style.SUCCESS(
            f'\nImport complete! Created: {created_count}, Updated: {updated_count}'
        ))
