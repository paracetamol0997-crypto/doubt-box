from django.core.management.base import BaseCommand
from accounts.models import User, StudentProfile, TeacherProfile
from subjects.models import Subject, TeacherSubject
from doubts.models import Doubt, DoubtAnswer, DoubtStatusHistory
from notifications.models import Notification


class Command(BaseCommand):
    help = 'Seeds initial administrative, faculty, student, and subject data for Doubt Box.'

    def handle(self, *args, **options):
        self.stdout.write("Initializing Doubt Box seed data...")

        # 1. Create Admin
        admin_email = "admin@doubtbox.edu"
        admin_user, created = User.objects.get_or_create(
            email=admin_email,
            defaults={
                'full_name': 'Chief Academic Administrator',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin_user.set_password("Admin@12345")
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f"Created Admin: {admin_email} (Password: Admin@12345)"))
        else:
            self.stdout.write(f"Admin {admin_email} already exists.")

        # 2. Create Standard Subjects
        subjects_data = [
            {"code": "CS101", "name": "Introduction to Computer Science & Python", "department": "Computer Science", "description": "Fundamentals of programming, data structures, and algorithmic problem solving."},
            {"code": "CS201", "name": "Data Structures and Algorithms", "department": "Computer Science", "description": "Trees, graphs, dynamic programming, and complexity analysis."},
            {"code": "MATH101", "name": "Engineering Calculus and Linear Algebra", "department": "Mathematics", "description": "Multivariable calculus, matrix decompositions, eigenvalues, and vectors."},
            {"code": "MATH202", "name": "Probability and Discrete Mathematics", "department": "Mathematics", "description": "Combinatorics, graph theory, random variables, and probability distributions."},
            {"code": "EE101", "name": "Digital Logic and Microprocessors", "department": "Electronics", "description": "Boolean algebra, combinational logic, sequential circuits, and architectures."},
            {"code": "PHY101", "name": "Applied Engineering Physics", "department": "Physics", "description": "Electromagnetism, quantum mechanics intro, and optics for engineers."},
        ]

        created_subjects = {}
        for s_data in subjects_data:
            subject, _ = Subject.objects.get_or_create(
                code=s_data["code"],
                defaults={
                    "name": s_data["name"],
                    "department": s_data["department"],
                    "description": s_data["description"]
                }
            )
            created_subjects[subject.code] = subject
        self.stdout.write(self.style.SUCCESS(f"Loaded {len(subjects_data)} academic subjects."))

        # 3. Create Approved Teacher (Alan Turing - Computer Science)
        t1_email = "alan.turing@doubtbox.edu"
        t1_user, created = User.objects.get_or_create(
            email=t1_email,
            defaults={'username': t1_email, 'full_name': 'Dr. Alan Turing', 'role': User.Role.TEACHER}
        )
        if created:
            t1_user.set_password("Faculty@12345")
            t1_user.save()
        t1_profile, _ = TeacherProfile.objects.get_or_create(
            user=t1_user,
            defaults={
                'employee_id': 'FAC-CS-001',
                'department': 'Computer Science',
                'is_approved': True,
                'approved_by': admin_user
            }
        )
        t1_profile.is_approved = True
        t1_profile.save()

        # Assign CS subjects to Alan Turing
        TeacherSubject.objects.get_or_create(teacher=t1_profile, subject=created_subjects["CS101"], defaults={'is_primary': True})
        TeacherSubject.objects.get_or_create(teacher=t1_profile, subject=created_subjects["CS201"])

        # 4. Create Approved Teacher (Ada Lovelace - Mathematics)
        t2_email = "ada.lovelace@doubtbox.edu"
        t2_user, created = User.objects.get_or_create(
            email=t2_email,
            defaults={'username': t2_email, 'full_name': 'Prof. Ada Lovelace', 'role': User.Role.TEACHER}
        )
        if created:
            t2_user.set_password("Faculty@12345")
            t2_user.save()
        t2_profile, _ = TeacherProfile.objects.get_or_create(
            user=t2_user,
            defaults={
                'employee_id': 'FAC-MATH-002',
                'department': 'Mathematics',
                'is_approved': True,
                'approved_by': admin_user
            }
        )
        t2_profile.is_approved = True
        t2_profile.save()

        # Assign Math subjects to Ada Lovelace
        TeacherSubject.objects.get_or_create(teacher=t2_profile, subject=created_subjects["MATH101"], defaults={'is_primary': True})
        TeacherSubject.objects.get_or_create(teacher=t2_profile, subject=created_subjects["MATH202"])

        # 5. Create Pending Teacher (for approval demonstration)
        t3_email = "pending.faculty@doubtbox.edu"
        t3_user, created = User.objects.get_or_create(
            email=t3_email,
            defaults={'username': t3_email, 'full_name': 'Dr. Richard Feynman', 'role': User.Role.TEACHER}
        )
        if created:
            t3_user.set_password("Faculty@12345")
            t3_user.save()
        TeacherProfile.objects.get_or_create(
            user=t3_user,
            defaults={
                'employee_id': 'FAC-PHY-003',
                'department': 'Physics',
                'is_approved': False  # Pending!
            }
        )

        # 6. Create Demo Student (Alex Chen)
        s1_email = "alex.chen@doubtbox.edu"
        s1_user, created = User.objects.get_or_create(
            email=s1_email,
            defaults={'username': s1_email, 'full_name': 'Alex Chen', 'role': User.Role.STUDENT}
        )
        if created:
            s1_user.set_password("Student@12345")
            s1_user.save()
        s1_profile, _ = StudentProfile.objects.get_or_create(
            user=s1_user,
            defaults={
                'register_number': 'REG2026CS101',
                'department': 'Computer Science',
                'year_of_study': 2
            }
        )

        # 7. Create Demo Doubt & Answer
        doubt_1, created = Doubt.objects.get_or_create(
            doubt_id="DBT-2026-DEMO01",
            defaults={
                'student': s1_profile,
                'subject': created_subjects["CS201"],
                'title': 'How does Dijkstra algorithm handle negative edge weights?',
                'description': 'In lecture 4 we covered shortest paths. I understand why BFS works for unweighted graphs, but why does Dijkstra fail or enter infinite loops when negative edges are present, and should we always switch to Bellman-Ford in that case?',
                'priority': Doubt.Priority.HIGH,
                'status': Doubt.Status.ANSWERED,
                'assigned_teacher': t1_profile
            }
        )
        if created:
            DoubtStatusHistory.objects.create(
                doubt=doubt_1,
                changed_by=s1_user,
                old_status='NONE',
                new_status=Doubt.Status.PENDING,
                comment='Submitted by student'
            )
            DoubtAnswer.objects.create(
                doubt=doubt_1,
                teacher=t1_profile,
                content='Great question Alex! Dijkstra greedily marks vertices as finalized assuming that once a node is settled, no shorter path to it will ever be discovered. A negative edge breaks this greedy invariant because relaxing a negative weight edge later could lower the distance to an already visited vertex. For graphs with negative edge weights, you should use the Bellman-Ford algorithm or Johnson’s algorithm.',
                is_clarification_request=False
            )
            DoubtStatusHistory.objects.create(
                doubt=doubt_1,
                changed_by=t1_user,
                old_status=Doubt.Status.PENDING,
                new_status=Doubt.Status.ANSWERED,
                comment='Teacher published answer.'
            )

        self.stdout.write(self.style.SUCCESS("Doubt Box initialization complete!"))
        self.stdout.write("Credentials configured:")
        self.stdout.write("  Admin:    admin@doubtbox.edu / Admin@12345")
        self.stdout.write("  Teacher:  alan.turing@doubtbox.edu / Faculty@12345 (Approved - CS)")
        self.stdout.write("  Teacher:  ada.lovelace@doubtbox.edu / Faculty@12345 (Approved - Math)")
        self.stdout.write("  Teacher:  pending.faculty@doubtbox.edu / Faculty@12345 (Pending Approval)")
        self.stdout.write("  Student:  alex.chen@doubtbox.edu / Student@12345")
