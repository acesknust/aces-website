from django.db import migrations

def seed_categories(apps, schema_editor):
    Category = apps.get_model('nominations', 'Category')
    
    categories_data = [
        # Icons and leadership
        ("Icons and leadership", "Perfect Gentleman of the year"),
        ("Icons and leadership", "Perfect lady of the year"),
        ("Icons and leadership", "Student Leader of the year"),
        ("Icons and leadership", "Student politician of the year"),
        ("Icons and leadership", "Best male course rep"),
        ("Icons and leadership", "Best female course rep"),
        ("Icons and leadership", "Student Activist of the year"),
        ("Icons and leadership", "Student of the year"),

        # Free Voting categories
        ("Free Voting categories", "Eleesa executive of the year"),
        ("Free Voting categories", "Lecturer of the year"),
        ("Free Voting categories", "TA of the year"),

        # Influence and Popularity
        ("Influence and Popularity", "Most influential student"),
        ("Influence and Popularity", "Most popular Student"),
        ("Influence and Popularity", "Student influencer of the year"),
        ("Influence and Popularity", "Social Media Personality of the year"),

        # Style and Personality
        ("Style and Personality", "Student personality of the year"),
        ("Style and Personality", "Male Fashion Icon"),
        ("Style and Personality", "Female fashion Icon"),

        # Hustle and enterprise
        ("Hustle and enterprise", "Student entrepreneur of the year"),
        ("Hustle and enterprise", "Hardworking Appointee of the year"),
        ("Hustle and enterprise", "Male Fresher of the year"),
        ("Hustle and enterprise", "Female Fresher of the year"),

        # Academics and Intellect
        ("Academics and Intellect", "Outstanding student of the year"),

        # Talent and representation
        ("Talent and representation", "Sports personality of the year"),
        ("Talent and representation", "Male Face of Eleesa"),
        ("Talent and representation", "Female Face of ELEESA"),
        ("Talent and representation", "Most inspiring student"),
    ]

    for group, name in categories_data:
        Category.objects.get_or_create(
            name=name,
            defaults={'group_name': group, 'is_active': True}
        )

def unseed_categories(apps, schema_editor):
    Category = apps.get_model('nominations', 'Category')
    Category.objects.all().delete()

class Migration(migrations.Migration):

    dependencies = [
        ('nominations', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_categories, reverse_code=unseed_categories),
    ]
