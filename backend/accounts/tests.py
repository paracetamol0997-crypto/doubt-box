from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import User, StudentProfile, TeacherProfile
from subjects.models import Subject, TeacherSubject


class AccountsAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.subject = Subject.objects.create(
            code="CS101",
            name="Intro CS",
            department="Computer Science"
        )

    def test_student_registration_success(self):
        data = {
            'full_name': 'Grace Hopper',
            'register_number': 'REG2026CS999',
            'email': 'grace.hopper@doubtbox.edu',
            'department': 'Computer Science',
            'year_of_study': 1,
            'password': 'SecurePassword@123',
            'confirm_password': 'SecurePassword@123'
        }
        response = self.client.post(reverse('register-student'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertTrue(User.objects.filter(email='grace.hopper@doubtbox.edu').exists())
        self.assertTrue(StudentProfile.objects.filter(register_number='REG2026CS999').exists())

    def test_student_duplicate_register_number_rejected(self):
        # Register first
        self.client.post(reverse('register-student'), {
            'full_name': 'Student One',
            'register_number': 'REG111',
            'email': 'one@doubtbox.edu',
            'department': 'Computer Science',
            'year_of_study': 1,
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        }, format='json')

        # Try duplicate register number
        response = self.client.post(reverse('register-student'), {
            'full_name': 'Student Two',
            'register_number': 'reg111',  # case-insensitive check
            'email': 'two@doubtbox.edu',
            'department': 'Computer Science',
            'year_of_study': 1,
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_teacher_registration_is_pending_approval(self):
        data = {
            'full_name': 'John von Neumann',
            'email': 'von.neumann@doubtbox.edu',
            'employee_id': 'FAC-CS-888',
            'department': 'Computer Science',
            'subject_ids': [self.subject.id],
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        }
        response = self.client.post(reverse('register-teacher'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        teacher_profile = TeacherProfile.objects.get(employee_id='FAC-CS-888')
        # Crucial security check: must be pending approval!
        self.assertFalse(teacher_profile.is_approved)

    def test_portal_separation_student_blocked_from_teacher_login(self):
        # Register student
        self.client.post(reverse('register-student'), {
            'full_name': 'Student Separation',
            'register_number': 'REG-SEP-1',
            'email': 'sep.student@doubtbox.edu',
            'department': 'Computer Science',
            'year_of_study': 1,
            'password': 'Password@123',
            'confirm_password': 'Password@123'
        }, format='json')

        # Attempt to login via Teacher login portal
        response = self.client.post(reverse('login-teacher'), {
            'email': 'sep.student@doubtbox.edu',
            'password': 'Password@123'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
