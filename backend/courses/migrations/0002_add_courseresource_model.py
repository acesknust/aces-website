# Generated migration — adds CourseResource model and makes Course.resource_url optional

from django.db import migrations, models
import django.db.models.deletion
import courses.validators


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0001_initial'),
    ]

    operations = [
        # Make resource_url optional (was required before)
        migrations.AlterField(
            model_name='course',
            name='resource_url',
            field=models.URLField(
                blank=True,
                help_text='Legacy link (Google Drive / Firebase). Use Course Resources below for new uploads.',
                max_length=500,
                null=True,
            ),
        ),

        # Create CourseResource model
        migrations.CreateModel(
            name='CourseResource',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(help_text="e.g., 'Week 1-4 Slides', '2024 Final Exam', 'Lab Manual'", max_length=200)),
                ('resource_type', models.CharField(
                    choices=[
                        ('slides', 'Lecture Slides'),
                        ('past_exam', 'Past Exam'),
                        ('tutorial', 'Tutorial Sheet'),
                        ('lab_manual', 'Lab Manual'),
                        ('assignment', 'Assignment'),
                        ('textbook', 'Textbook / Reference'),
                        ('project', 'Project Files'),
                        ('other', 'Other'),
                    ],
                    default='slides',
                    max_length=20,
                )),
                ('file', models.FileField(
                    blank=True,
                    help_text='Upload a file (PDF, PPTX, ZIP, etc.) — max 100MB',
                    null=True,
                    upload_to='courses/%Y/',
                    validators=[courses.validators.validate_resource_file],
                )),
                ('external_url', models.URLField(
                    blank=True,
                    help_text='OR paste a Google Drive / Firebase / external link',
                    max_length=500,
                    null=True,
                )),
                ('file_size', models.PositiveBigIntegerField(
                    blank=True,
                    help_text='File size in bytes (auto-calculated on upload)',
                    null=True,
                )),
                ('file_extension', models.CharField(
                    blank=True,
                    help_text='Auto-detected file extension (pdf, pptx, zip, etc.)',
                    max_length=10,
                )),
                ('download_count', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True, help_text='Uncheck to hide from students')),
                ('sort_order', models.IntegerField(default=0, help_text='Order within the course')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('course', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='resources',
                    to='courses.course',
                )),
            ],
            options={
                'verbose_name': 'Course Resource',
                'verbose_name_plural': 'Course Resources',
                'ordering': ['resource_type', 'sort_order', '-created_at'],
            },
        ),
    ]
