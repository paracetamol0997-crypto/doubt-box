from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from accounts.models import User, StudentProfile, TeacherProfile
from subjects.models import Subject, TeacherSubject
from doubts.models import Doubt, DoubtAnswer
from notifications.models import Notification


class DoubtWorkflowSecurityTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Subject CS
        self.cs_subject = Subject.objects.create(
            code="CS101", name="Intro CS", department="Computer Science"
        )
        # Subject Math
        self.math_subject = Subject.objects.create(
            code="MATH101", name="Calculus", department="Mathematics"
        )

        # Student A
        self.student_a_user = User.objects.create_user(
            email="student.a@doubtbox.edu", username="student.a@doubtbox.edu",
            password="Password@123", full_name="Student A", role=User.Role.STUDENT
        )
        self.student_a_profile = StudentProfile.objects.create(
            user=self.student_a_user, register_number="STU-A-001", department="Computer Science"
        )

        # Student B
        self.student_b_user = User.objects.create_user(
            email="student.b@doubtbox.edu", username="student.b@doubtbox.edu",
            password="Password@123", full_name="Student B", role=User.Role.STUDENT
        )
        self.student_b_profile = StudentProfile.objects.create(
            user=self.student_b_user, register_number="STU-B-002", department="Computer Science"
        )

        # Teacher (Approved, CS)
        self.teacher_user = User.objects.create_user(
            email="prof.cs@doubtbox.edu", username="prof.cs@doubtbox.edu",
            password="Password@123", full_name="Prof CS", role=User.Role.TEACHER
        )
        self.teacher_profile = TeacherProfile.objects.create(
            user=self.teacher_user, employee_id="FAC-CS-01", department="Computer Science", is_approved=True
        )
        TeacherSubject.objects.create(teacher=self.teacher_profile, subject=self.cs_subject)

        # Teacher (Unapproved)
        self.unapproved_teacher_user = User.objects.create_user(
            email="unapproved@doubtbox.edu", username="unapproved@doubtbox.edu",
            password="Password@123", full_name="Unapproved", role=User.Role.TEACHER
        )
        self.unapproved_teacher_profile = TeacherProfile.objects.create(
            user=self.unapproved_teacher_user, employee_id="FAC-PENDING", department="Computer Science", is_approved=False
        )

    def test_student_can_create_doubt_and_notification_is_created(self):
        self.client.force_authenticate(user=self.student_a_user)
        response = self.client.post(reverse('student-doubts'), {
            'subject_id': self.cs_subject.id,
            'title': 'How does recursion work?',
            'description': 'I need help understanding base cases in recursive functions.',
            'priority': 'HIGH'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Doubt.objects.filter(title='How does recursion work?').exists())

        # Check that persistent notification was created for the approved CS teacher
        teacher_notif = Notification.objects.filter(recipient=self.teacher_user).first()
        self.assertIsNotNone(teacher_notif)
        self.assertIn("New Doubt in CS101", teacher_notif.title)

    def test_student_cannot_access_teacher_inbox(self):
        self.client.force_authenticate(user=self.student_a_user)
        response = self.client.get(reverse('teacher-doubts'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unapproved_teacher_cannot_access_teacher_inbox(self):
        self.client.force_authenticate(user=self.unapproved_teacher_user)
        response = self.client.get(reverse('teacher-doubts'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_read_another_students_doubt(self):
        # Create doubt for Student A
        doubt = Doubt.objects.create(
            student=self.student_a_profile,
            subject=self.cs_subject,
            title="Private Question A",
            description="Detailed explanation",
            priority=Doubt.Priority.MEDIUM
        )

        # Authenticate as Student B and try to view Student A's doubt
        self.client.force_authenticate(user=self.student_b_user)
        response = self.client.get(reverse('student-doubt-detail', kwargs={'doubt_id': doubt.doubt_id}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_teacher_can_answer_doubt(self):
        doubt = Doubt.objects.create(
            student=self.student_a_profile,
            subject=self.cs_subject,
            title="Question for Teacher",
            description="Please explain Big O.",
            priority=Doubt.Priority.HIGH
        )

        self.client.force_authenticate(user=self.teacher_user)
        response = self.client.post(
            reverse('teacher-doubt-answer', kwargs={'doubt_id': doubt.doubt_id}),
            {
                'content': 'Big O represents the upper bound of the runtime as the input size scales.',
                'is_clarification_request': False
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify doubt is updated to ANSWERED
        doubt.refresh_from_db()
        self.assertEqual(doubt.status, Doubt.Status.ANSWERED)
        self.assertEqual(doubt.assigned_teacher, self.teacher_profile)

        # Verify answer was saved
        self.assertEqual(doubt.answers.count(), 1)

        # Verify notification was sent to student
        student_notif = Notification.objects.filter(recipient=self.student_a_user).first()
        self.assertIsNotNone(student_notif)
        self.assertEqual(student_notif.notification_type, Notification.NotificationType.DOUBT_ANSWERED)
