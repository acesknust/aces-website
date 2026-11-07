from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('student_businesses', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='business',
            name='category',
        ),
        migrations.AddField(
            model_name='business',
            name='banner',
            field=models.ImageField(blank=True, null=True, upload_to='student_businesses/banners/'),
        ),
        migrations.AddField(
            model_name='business',
            name='payment_method',
            field=models.TextField(blank=True, help_text='e.g., MTN MoMo: 0541234567 (Kwame)'),
        ),
        migrations.AddField(
            model_name='product',
            name='category',
            field=models.CharField(choices=[('Food & Beverages', 'Food & Beverages'), ('Fashion & Apparel', 'Fashion & Apparel'), ('Technology & Electronics', 'Technology & Electronics'), ('Services (Design, Tutoring, etc)', 'Services'), ('Beauty & Cosmetics', 'Beauty & Cosmetics'), ('Other', 'Other')], default='Other', max_length=50),
        ),
    ]
