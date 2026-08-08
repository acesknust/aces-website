from django.db import migrations

def rename_all_eleesa_to_aces(apps, schema_editor):
    Category = apps.get_model('nominations', 'Category')
    for cat in Category.objects.all():
        if "eleesa" in cat.name.lower():
            cat.name = cat.name.replace("Eleesa", "ACES").replace("ELEESA", "ACES").replace("eleesa", "ACES")
            cat.save()

def reverse_rename(apps, schema_editor):
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('nominations', '0005_nomination_nominee_whatsapp_and_more'),
    ]

    operations = [
        migrations.RunPython(rename_all_eleesa_to_aces, reverse_rename),
    ]
