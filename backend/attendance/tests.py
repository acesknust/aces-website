from io import BytesIO

from openpyxl import load_workbook
from rest_framework.test import APITestCase

from users.models import CustomUser, Role
from .models import AttendanceRecord, AttendanceSession


class RolesAndAttendanceTests(APITestCase):
    def setUp(self):
        self.boss = CustomUser.objects.create_superuser('pm@aces.org', 'pm', 'pass12345!')
        self.student = CustomUser.objects.create_user('kofi@aces.org', 'kofi', 'pass12345!')

    def test_only_super_admin_can_manage_roles(self):
        self.client.force_authenticate(self.student)
        self.assertEqual(self.client.get('/api/user/roles/').status_code, 403)

        self.client.force_authenticate(self.boss)
        res = self.client.post('/api/user/roles/', {'name': 'Secretary', 'perks': ['take_attendance']}, format='json')
        self.assertEqual(res.status_code, 201)
        bad = self.client.post('/api/user/roles/', {'name': 'X', 'perks': ['fly']}, format='json')
        self.assertEqual(bad.status_code, 400)

    def test_super_admin_assigns_role_and_perk_unlocks_attendance(self):
        role = Role.objects.create(name='Secretary', perks=['take_attendance'])

        self.client.force_authenticate(self.student)
        self.assertEqual(self.client.post('/api/attendance/sessions/', {'title': 'Meeting'}).status_code, 403)

        self.client.force_authenticate(self.boss)
        res = self.client.patch(f'/api/user/members/{self.student.id}/', {'roles': [role.id]}, format='json')
        self.assertEqual(res.status_code, 200)

        self.client.force_authenticate(self.student)
        me = self.client.get('/api/user/me/').json()
        self.assertEqual(me['perks'], ['take_attendance'])

        res = self.client.post('/api/attendance/sessions/', {'title': 'General Meeting'})
        self.assertEqual(res.status_code, 201)
        sid = res.json()['id']
        res = self.client.post(f'/api/attendance/sessions/{sid}/records/', {'full_name': 'Ama Mensah', 'index_number': '123'})
        self.assertEqual(res.status_code, 201)
        dup = self.client.post(f'/api/attendance/sessions/{sid}/records/', {'full_name': 'Ama M', 'index_number': '123'})
        self.assertEqual(dup.status_code, 400)

        # Taking attendance does not include exporting
        self.assertEqual(self.client.get(f'/api/attendance/sessions/{sid}/export/').status_code, 403)

    def test_role_holder_can_use_admin_login(self):
        res = self.client.post('/api/user/admin/login/', {'email': 'kofi@aces.org', 'password': 'pass12345!'})
        self.assertEqual(res.status_code, 401)
        self.student.roles.add(Role.objects.create(name='Secretary', perks=['take_attendance']))
        res = self.client.post('/api/user/admin/login/', {'email': 'kofi@aces.org', 'password': 'pass12345!'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()['perks'], ['take_attendance'])

    def test_bulk_mark_and_excel_export(self):
        self.client.force_authenticate(self.boss)
        session = AttendanceSession.objects.create(title='Codefest Day 1', created_by=self.boss)
        res = self.client.post(
            f'/api/attendance/sessions/{session.id}/records/bulk/',
            {'text': 'Ama Mensah, 101\nKwame Boateng, 102\n\nAma Again, 101'},
            format='json',
        )
        self.assertEqual(len(res.json()['created']), 2)
        self.assertEqual(len(res.json()['skipped']), 1)
        AttendanceRecord.objects.filter(index_number='102').update(status='late')

        res = self.client.get(f'/api/attendance/sessions/{session.id}/export/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('Codefest_Day_1_', res['Content-Disposition'])
        ws = load_workbook(BytesIO(res.content)).active
        rows = [r for r in ws.iter_rows(values_only=True)]
        self.assertEqual(rows[3][:5], ('#', 'Full name', 'Index number', 'Email', 'Status'))
        self.assertEqual(rows[4][1:3], ('Ama Mensah', '101'))
        self.assertEqual(rows[5][4], 'Late')

    def test_students_can_no_longer_edit_events(self):
        self.client.force_authenticate(self.student)
        res = self.client.post('/api/events/', {'name': 'x'})
        self.assertEqual(res.status_code, 403)
