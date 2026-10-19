"""Seed the local database with shop data for payment-gateway testing.

Usage:
    python manage.py seed_shop
    python manage.py seed_shop --reset
    python manage.py seed_shop --no-orders
    python manage.py seed_shop --no-images
"""
import shutil
import uuid
from datetime import timedelta
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from payment_logs.models import WebhookLog
from shop.models import (
    Category,
    Coupon,
    Order,
    OrderItem,
    Product,
    ProductImage,
    ProductSize,
    SiteSettings,
)

APP_DIR = Path(__file__).resolve().parents[3]

CATEGORIES = ['Clothing', 'Accessories', 'Souvenirs']

PRODUCTS = [
    {
        'name': 'ACES Hoodie (Black)',
        'description': 'Premium cotton hoodie with the embroidered ACES logo.',
        'price': '2.00',
        'category': 'Clothing',
        'stock': 50,
        'has_sizes': True,
        'image': ('ACES-Hoodie1.jpg', 'aces-hoodie-black.jpg'),
        'sizes': ['S', 'M', 'L', 'XL'],
        'variants': [
            ('Black', 'variants/ACES-Hoddie.jpg', 'aces-hoodie-black-variant.jpg'),
            ('Pink', 'variants/ACES-Hoodie.pink.png', 'aces-hoodie-pink.png'),
        ],
    },
    {
        'name': 'ACES T-Shirt (White)',
        'description': 'Official ACES t-shirt in breathable cotton.',
        'price': '2.00',
        'category': 'Clothing',
        'stock': 75,
        'has_sizes': True,
        'image': ('ACES-T-shirt2.jpg', 'aces-tshirt-white.jpg'),
        'sizes': ['S', 'M', 'L', 'XL'],
        'variants': [
            ('White', 'variants/ACES-T-shirt2.jpg', 'aces-tshirt-white-variant.jpg'),
        ],
    },
    {
        'name': 'ACES T-Shirt (Blue)',
        'description': 'Official ACES t-shirt in ACES blue.',
        'price': '2.00',
        'category': 'Clothing',
        'stock': 60,
        'has_sizes': True,
        'image': ('variants/ACES-T-shirt1.jpg', 'aces-tshirt-blue.jpg'),
        'sizes': ['S', 'M', 'L'],
        'variants': [
            ('Blue', 'variants/ACES-T-shirt1.jpg', 'aces-tshirt-blue-variant.jpg'),
        ],
    },
    {
        'name': 'ACES Polo Shirt',
        'description': 'Smart, breathable departmental polo shirt.',
        'price': '2.00',
        'category': 'Clothing',
        'stock': 100,
        'has_sizes': True,
        'image': ('variants/ACES-T-shirt.jpg', 'aces-polo.jpg'),
        'sizes': ['S', 'M', 'L', 'XL'],
        'variants': [],
    },
    {
        'name': 'Custom Notebook',
        'description': 'Hardcover notebook for algorithms and circuit designs.',
        'price': '2.00',
        'category': 'Accessories',
        'stock': 200,
        'has_sizes': False,
        'image': None,
        'sizes': [],
        'variants': [],
    },
    {
        'name': 'ACES Sticker Pack',
        'description': 'Pack of 5 distinct ACES stickers for your laptop.',
        'price': '2.00',
        'category': 'Accessories',
        'stock': 500,
        'has_sizes': False,
        'image': None,
        'sizes': [],
        'variants': [],
    },
    {
        'name': 'Keyholder',
        'description': 'Metal keyholder with ACES branding.',
        'price': '2.00',
        'category': 'Souvenirs',
        'stock': 150,
        'has_sizes': False,
        'image': None,
        'sizes': [],
        'variants': [],
    },
]

COUPONS = [
    {
        'code': 'WELCOME10',
        'owner_name': 'Local Test Committee Head',
        'owner_role': 'Tester',
        'discount_percent': 10,
        'max_uses': 100,
    },
    {
        'code': 'ACES20',
        'owner_name': 'Local Test Committee Head',
        'owner_role': 'Tester',
        'discount_percent': 20,
        'max_uses': 50,
    },
]


class Command(BaseCommand):
    help = (
        'Seed the local SQLite database with categories, products, sizes, '
        'images, coupons and optional sample orders for payment testing.'
    )

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete existing shop data and webhook logs before seeding.',
        )
        parser.add_argument(
            '--no-orders',
            action='store_true',
            help='Skip creating sample orders.',
        )
        parser.add_argument(
            '--no-images',
            action='store_true',
            help='Skip copying product images into MEDIA_ROOT.',
        )

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError(
                'seed_shop only runs with DEBUG=True so it cannot touch production data.'
            )

        with transaction.atomic():
            if options['reset']:
                self._reset()

            categories = self._seed_categories()
            products = self._seed_products(categories, copy_images=not options['no_images'])
            self._seed_coupons()

            site_settings = SiteSettings.get()
            site_settings.is_shop_open = True
            site_settings.save()

            if not options['no_orders']:
                self._seed_orders(products)

        self._print_summary()

    def _reset(self):
        self.stdout.write(self.style.WARNING('Deleting existing shop data...'))
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        ProductImage.objects.all().delete()
        ProductSize.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        Coupon.objects.all().delete()
        WebhookLog.objects.all().delete()

        media_root = Path(settings.MEDIA_ROOT or '')
        for folder in ('products', 'receipts'):
            target = media_root / folder
            if target.exists():
                shutil.rmtree(target)
                self.stdout.write(f'  - media/{folder}/')

    def _seed_categories(self):
        categories = {}
        for name in CATEGORIES:
            category, created = Category.objects.get_or_create(name=name)
            categories[name] = category
            if created:
                self.stdout.write(f'  + category: {name}')
        return categories

    def _seed_products(self, categories, copy_images=True):
        products = {}
        for data in PRODUCTS:
            product, created = Product.objects.update_or_create(
                name=data['name'],
                defaults={
                    'description': data['description'],
                    'price': Decimal(data['price']),
                    'category': categories[data['category']],
                    'stock': data['stock'],
                    'is_active': True,
                    'has_sizes': data['has_sizes'],
                },
            )
            products[data['name']] = product
            self.stdout.write(
                self.style.SUCCESS(f'  {"+" if created else "="} product: {product.name}')
            )

            for order_index, size in enumerate(data['sizes']):
                ProductSize.objects.get_or_create(
                    product=product,
                    name=size,
                    defaults={'display_order': order_index, 'is_available': True},
                )

            if copy_images and data['image'] and not product.image:
                self._attach_image(product.image, *data['image'], label=product.name)

            for color, source, dest_name in data['variants']:
                variant, _ = ProductImage.objects.get_or_create(
                    product=product,
                    color=color,
                )
                if copy_images and not variant.image:
                    self._attach_image(
                        variant.image,
                        source,
                        dest_name,
                        label=f'{product.name} ({color})',
                    )

        return products

    def _attach_image(self, field, source_name, dest_name, label):
        source = APP_DIR / 'products' / source_name
        if not source.exists():
            self.stdout.write(
                self.style.WARNING(f'  ! image missing for {label}: {source}')
            )
            return
        with source.open('rb') as handle:
            field.save(dest_name, File(handle), save=True)
        self.stdout.write(f'    image: {dest_name}')

    def _seed_coupons(self):
        expires_at = timezone.now() + timedelta(days=30)
        for data in COUPONS:
            _, created = Coupon.objects.update_or_create(
                code=data['code'],
                defaults={
                    'owner_name': data['owner_name'],
                    'owner_role': data['owner_role'],
                    'discount_percent': data['discount_percent'],
                    'max_uses': data['max_uses'],
                    'times_used': 0,
                    'expires_at': expires_at,
                    'is_active': True,
                },
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'  {"+" if created else "="} coupon: {data["code"]} '
                    f'({data["discount_percent"]}% off)'
                )
            )

    def _seed_orders(self, products):
        hoodie = products['ACES Hoodie (Black)']
        tshirt = products['ACES T-Shirt (White)']

        self._create_order(
            email='momo.pending@seed.aces.local',
            full_name='MoMo Pending Tester',
            payment_method='MOMO',
            status='PENDING',
            reference=None,
            items=[(hoodie, 1, hoodie.price, 'Black', 'L')],
        )
        self._create_order(
            email='paystack.pending@seed.aces.local',
            full_name='Paystack Pending Tester',
            payment_method='PAYSTACK',
            status='PENDING',
            reference='seed-paystack-pending-ref',
            items=[(tshirt, 2, tshirt.price, 'White', 'M')],
        )
        self._create_order(
            email='paystack.paid@seed.aces.local',
            full_name='Paystack Paid Tester',
            payment_method='PAYSTACK',
            status='PAID',
            reference='seed-paystack-paid-ref',
            items=[(tshirt, 1, tshirt.price, 'White', 'L')],
            verification_code=str(uuid.uuid4()),
        )
        self._create_order(
            email='momo.paid@seed.aces.local',
            full_name='MoMo Paid Tester',
            payment_method='MOMO',
            status='PAID',
            reference=None,
            items=[(hoodie, 2, hoodie.price, 'Pink', 'M')],
            momo_sender_name='Seed Sender',
            momo_amount_paid=hoodie.price * 2,
        )

    def _create_order(
        self,
        *,
        email,
        full_name,
        payment_method,
        status,
        reference,
        items,
        momo_sender_name='',
        momo_amount_paid=None,
        verification_code='',
    ):
        lookup = (
            {'paystack_reference': reference}
            if reference
            else {'email': email, 'payment_method': 'MOMO'}
        )
        if Order.objects.filter(**lookup).exists():
            self.stdout.write(f'  = order exists: {email}')
            return

        total = sum((price * quantity for _, quantity, price, _, _ in items), Decimal('0'))
        order = Order.objects.create(
            full_name=full_name,
            email=email,
            phone='0200000000',
            address='Local Test Hostel',
            total_amount=total,
            status=status,
            payment_method=payment_method,
            paystack_reference=reference,
            momo_sender_name=momo_sender_name or None,
            momo_amount_paid=momo_amount_paid,
            verification_code=verification_code or None,
        )
        for product, quantity, price, color, size in items:
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=price,
                selected_color=color,
                selected_size=size,
            )
        self.stdout.write(
            self.style.SUCCESS(f'  + order #{order.id}: {payment_method} {status} ({email})')
        )

    def _print_summary(self):
        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('Local shop database is ready.'))
        self.stdout.write(f'  Products : {Product.objects.count()}')
        self.stdout.write(f'  Coupons  : {", ".join(Coupon.objects.values_list("code", flat=True))}')
        self.stdout.write(f'  Orders   : {Order.objects.count()}')
        self.stdout.write('')
        self.stdout.write('Payment gateway testing:')
        self.stdout.write('  • Mobile Money: choose "Mobile Money" and upload any receipt image.')
        self.stdout.write('  • Paystack    : choose "Paystack" and complete the hosted checkout.')
        self.stdout.write(
            '  • Paystack mock mode (no keys/network): set PAYSTACK_MOCK_MODE=True in backend/.env'
        )
        self.stdout.write('')
        self.stdout.write('Endpoints:')
        self.stdout.write('  Storefront : http://localhost:3000/shop')
        self.stdout.write('  API status : http://127.0.0.1:8000/api/shop/status/')
        self.stdout.write('  Admin      : http://127.0.0.1:8000/admin/')
