from django.db import migrations

def rename_eleesa_to_aces(apps, schema_editor):
    Category = apps.get_model('nominations', 'Category')
    Category.objects.filter(name__iexact="Eleesa executive of the year").update(name="ACES Executive of the Year")
    Category.objects.filter(name__iexact="Male Face of Eleesa").update(name="Male Face of ACES")
    Category.objects.filter(name__iexact="Female Face of ELEESA").update(name="Female Face of ACES")

def reverse_rename(apps, schema_editor):
    Category = apps.get_model('nominations', 'Category')
    Category.objects.filter(name__iexact="ACES Executive of the Year").update(name="Eleesa executive of the year")
    Category.objects.filter(name__iexact="Male Face of ACES").update(name="Male Face of Eleesa")
    Category.objects.filter(name__iexact="Female Face of ACES").update(name="Female Face of ELEESA")

class Migration(migrations.Migration):
    dependencies = [
        ('nominations', '0003_nomination_nominee_email_nomination_nominee_phone'),
    ]

    operations = [
        migrations.RunPython(rename_eleesa_to_aces, reverse_rename),
    ]
