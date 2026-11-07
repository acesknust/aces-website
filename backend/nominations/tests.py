import io
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Nomination, NominationSettings

def generate_test_image():
    file = io.BytesIO()
    image = Image.new('RGB', (100, 100), color='red')
    image.save(file, 'jpeg')
    file.seek(0)
    return SimpleUploadedFile("test_nominee.jpg", file.read(), content_type="image/jpeg")


class NominationsAPITests(APITestCase):

    def setUp(self):
        self.category_active = Category.objects.create(
            group_name="Influence and Popularity",
            name="Most Influential Student",
            is_active=True
        )
        self.category_inactive = Category.objects.create(
            group_name="Influence and Popularity",
            name="Secret Category",
            is_active=False
        )
        self.settings = NominationSettings.get_settings()
        self.settings.is_open = True
        self.settings.save()

    def test_categories_list_active_only(self):
        url = reverse('nominations:category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        names = [c['name'] for c in data]
        self.assertIn("Most Influential Student", names)
        self.assertNotIn("Secret Category", names)

    def test_status_endpoint(self):
        url = reverse('nominations:nomination-status')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()['is_open'])

        self.settings.is_open = False
        self.settings.save()
        response = self.client.get(url)
        self.assertFalse(response.json()['is_open'])

    def test_submit_nomination_success(self):
        url = reverse('nominations:nomination-create')
        photo = generate_test_image()
        payload = {
            'nominee_name': 'Kwame Mensah',
            'category': self.category_active.id,
            'nominee_photo': photo,
            'nominator_name': 'Abena Osei',
            'nominator_phone': '0241234567',
            'nominator_email': 'abena@knust.edu.gh'
        }
        response = self.client.post(url, payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Nomination.objects.count(), 1)
        nomination = Nomination.objects.first()
        self.assertEqual(nomination.nominee_name, 'Kwame Mensah')

    def test_submit_nomination_closed(self):
        self.settings.is_open = False
        self.settings.save()

        url = reverse('nominations:nomination-create')
        photo = generate_test_image()
        payload = {
            'nominee_name': 'Kofi Annan',
            'category': self.category_active.id,
            'nominee_photo': photo,
            'nominator_name': 'Abena Osei',
            'nominator_phone': '0241234567',
            'nominator_email': 'abena@knust.edu.gh'
        }
        response = self.client.post(url, payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_nomination_case_insensitive(self):
        url = reverse('nominations:nomination-create')
        photo1 = generate_test_image()
        payload1 = {
            'nominee_name': '  John   Doe  ',
            'category': self.category_active.id,
            'nominee_photo': photo1,
            'nominator_name': 'Nominator 1',
            'nominator_phone': '0241234567',
            'nominator_email': 'nom1@knust.edu.gh'
        }
        res1 = self.client.post(url, payload1, format='multipart')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        photo2 = generate_test_image()
        payload2 = {
            'nominee_name': 'john doe',
            'category': self.category_active.id,
            'nominee_photo': photo2,
            'nominator_name': 'Nominator 2',
            'nominator_phone': '0247654321',
            'nominator_email': 'nom2@knust.edu.gh'
        }
        res2 = self.client.post(url, payload2, format='multipart')
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("nominee_name", res2.json())

    def test_honeypot_spam_rejection(self):
        url = reverse('nominations:nomination-create')
        photo = generate_test_image()
        payload = {
            'nominee_name': 'Bot Candidate',
            'category': self.category_active.id,
            'nominee_photo': photo,
            'nominator_name': 'Bot Spam',
            'nominator_phone': '0241234567',
            'nominator_email': 'bot@spam.com',
            'hp_website': 'http://spam-link.com'
        }
        response = self.client.post(url, payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_invalid_file_extension(self):
        url = reverse('nominations:nomination-create')
        bad_file = SimpleUploadedFile("document.pdf", b"fake pdf content", content_type="application/pdf")
        payload = {
            'nominee_name': 'Kofi Annan',
            'category': self.category_active.id,
            'nominee_photo': bad_file,
            'nominator_name': 'Abena Osei',
            'nominator_phone': '0241234567',
            'nominator_email': 'abena@knust.edu.gh'
        }
        response = self.client.post(url, payload, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
