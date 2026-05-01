#!/bin/bash
# Post-deploy script for DigitalOcean App Platform
# This script runs migrations, loads initial data, and migrates legacy resources

echo "Running database migrations..."
python manage.py migrate --no-input

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Loading course data..."
# Only load if courses table is empty (prevents duplicate imports)
python manage.py shell -c "
from courses.models import Course
if Course.objects.count() == 0:
    print('No courses found. Importing from fixtures...')
    import subprocess
    subprocess.run(['python', 'manage.py', 'loaddata', 'courses_data.json'])
else:
    print(f'Courses already exist ({Course.objects.count()} found). Skipping import.')
"

echo "Migrating legacy resource URLs to CourseResource objects..."
python manage.py migrate_legacy_resources

echo "Build complete!"

