"""
Management command: migrate_legacy_resources

Converts existing Course.resource_url values into CourseResource objects.
This is a one-time migration to transition from the old single-URL-per-course
model to the new multi-resource model.

Safe to run multiple times — it skips courses that have already been migrated.
Does NOT delete the original resource_url field.
"""

from django.core.management.base import BaseCommand
from courses.models import Course, CourseResource


class Command(BaseCommand):
    help = "Migrate legacy Course.resource_url values into CourseResource objects."

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be migrated without making changes.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        # Find all courses with a legacy resource_url
        courses_with_urls = Course.objects.exclude(
            resource_url__isnull=True
        ).exclude(
            resource_url=''
        )

        total = courses_with_urls.count()
        self.stdout.write(f"Found {total} courses with legacy resource URLs.")

        created = 0
        skipped = 0

        for course in courses_with_urls:
            # Skip if this URL has already been migrated
            if course.resources.filter(external_url=course.resource_url).exists():
                skipped += 1
                if options['verbosity'] >= 2:
                    self.stdout.write(f"  SKIP: {course} (already migrated)")
                continue

            # Detect resource type from URL
            url = course.resource_url.lower()
            if '.zip' in url or '.rar' in url:
                resource_type = 'slides'  # Legacy ZIPs are typically slide bundles
                title = f"{course.name} — Course Materials"
            elif '.pdf' in url:
                resource_type = 'slides'
                title = f"{course.name} — Lecture Slides"
            else:
                resource_type = 'other'
                title = f"{course.name} — Course Materials"

            if dry_run:
                self.stdout.write(
                    f"  WOULD CREATE: {course.code or course.name} → "
                    f"'{title}' ({resource_type})"
                )
            else:
                CourseResource.objects.create(
                    course=course,
                    title=title,
                    resource_type=resource_type,
                    external_url=course.resource_url,
                )
                if options['verbosity'] >= 2:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"  CREATED: {course.code or course.name} → '{title}'"
                        )
                    )

            created += 1

        if dry_run:
            self.stdout.write(self.style.WARNING(
                f"\nDRY RUN: Would create {created} resources. "
                f"Skipped {skipped} already-migrated. Run without --dry-run to apply."
            ))
        else:
            self.stdout.write(self.style.SUCCESS(
                f"\nDone! Created {created} CourseResource objects. "
                f"Skipped {skipped} already-migrated."
            ))
