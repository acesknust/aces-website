"""
Management command to create a 'Courses Manager' group and a staff user
with permissions limited to the Courses app only.

Usage:
  python manage.py create_courses_manager --username coursesadmin --password <password>
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from courses.models import AcademicYear, Semester, Course, CourseResource

User = get_user_model()

COURSES_MODELS = [AcademicYear, Semester, Course, CourseResource]


class Command(BaseCommand):
    help = 'Create a "Courses Manager" group and optionally a staff user with courses-only permissions.'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, required=True, help='Username for the new staff user')
        parser.add_argument('--password', type=str, required=True, help='Password for the new staff user')
        parser.add_argument('--email', type=str, default='', help='Email for the new staff user')

    def handle(self, *args, **options):
        # 1. Create or get the "Courses Manager" group
        group, created = Group.objects.get_or_create(name='Courses Manager')
        if created:
            self.stdout.write(self.style.SUCCESS('✅ Created "Courses Manager" group'))
        else:
            self.stdout.write('ℹ️  "Courses Manager" group already exists')

        # 2. Assign all permissions for courses models to the group
        group.permissions.clear()
        for model in COURSES_MODELS:
            ct = ContentType.objects.get_for_model(model)
            perms = Permission.objects.filter(content_type=ct)
            for perm in perms:
                group.permissions.add(perm)
                self.stdout.write(f'   + {perm.codename}')

        self.stdout.write(self.style.SUCCESS(f'✅ Assigned {group.permissions.count()} permissions to group'))

        # 3. Create the staff user
        username = options['username']
        password = options['password']
        email = options.get('email', '')

        user, user_created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'is_staff': True,      # Required to access /admin/
                'is_superuser': False,  # Critical: limits access
            }
        )

        if user_created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'✅ Created staff user "{username}"'))
        else:
            self.stdout.write(f'ℹ️  User "{username}" already exists — updating permissions')
            user.is_staff = True
            user.is_superuser = False
            user.save()

        # 4. Add user to the group
        user.groups.add(group)
        self.stdout.write(self.style.SUCCESS(f'✅ Added "{username}" to "Courses Manager" group'))
        self.stdout.write(self.style.SUCCESS(f'\n🎉 Done! "{username}" can now log into /admin/ and manage courses only.'))
