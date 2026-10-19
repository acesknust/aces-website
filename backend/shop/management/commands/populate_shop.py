from django.core.management.base import BaseCommand
from shop.models import Category, Product

class Command(BaseCommand):
    help = 'Populates the shop with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating shop data...')

        # Create Categories
        cat_clothing, _ = Category.objects.get_or_create(name='Clothing')
        cat_accessories, _ = Category.objects.get_or_create(name='Accessories')
        cat_souvenirs, _ = Category.objects.get_or_create(name='Souvenirs')

        # Create Products
        products = [
            {
                'name': 'ACES Hoodie (Black)',
                'description': 'Premium quality cotton hoodie with embroidered ACES logo. Keeps you warm during those late night coding sessions.',
                'price': 150.00,
                'category': cat_clothing,
                'stock': 50
            },
            {
                'name': 'ACES Polo Shirt',
                'description': 'Official departmental polo shirt. Smart, breathable, and perfect for lectures.',
                'price': 80.00,
                'category': cat_clothing,
                'stock': 100
            },
            {
                'name': 'ACES Lacoste',
                'description': 'Stylish Lacoste t-shirt with the ACES crest.',
                'price': 90.00,
                'category': cat_clothing,
                'stock': 75
            },
            {
                'name': 'Custom Notebook',
                'description': 'Hardcover notebook for jotting down your algorithms and circuit designs.',
                'price': 25.00,
                'category': cat_accessories,
                'stock': 200
            },
            {
                'name': 'ACES Sticker Pack',
                'description': 'Pack of 5 distinct ACES stickers for your laptop.',
                'price': 10.00,
                'category': cat_accessories,
                'stock': 500
            },
            {
                'name': 'Keyholder',
                'description': 'Metal keyholder with ACES branding.',
                'price': 15.00,
                'category': cat_souvenirs,
                'stock': 150
            }
        ]

        for p_data in products:
            product, created = Product.objects.get_or_create(
                name=p_data['name'],
                defaults={
                    'description': p_data['description'],
                    'price': p_data['price'],
                    'category': p_data['category'],
                    'stock': p_data['stock'],
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created product: {product.name}'))
            else:
                self.stdout.write(f'Product already exists: {product.name}')

        self.stdout.write(self.style.SUCCESS('Successfully populated shop!'))
