from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .models import User, TeacherProfile
from .serializers import (
    StudentRegistrationSerializer,
    TeacherRegistrationSerializer,
    LoginSerializer,
    UserSerializer,
    TeacherProfileSerializer
)
from .permissions import IsAdminUser


class StudentRegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = StudentRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'message': 'Student registration successful. Welcome to Doubt Box!',
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeacherRegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = TeacherRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'message': 'Teacher registration submitted successfully. Your account is pending administrator approval before you can access the teacher dashboard.',
                'token': token.key,
                'user': UserSerializer(user).data,
                'is_approved': False
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentLoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        password = serializer.validated_data['password']

        user = authenticate(request, username=email, password=password)
        if not user:
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.role != User.Role.STUDENT:
            return Response({
                'detail': 'Access denied. This login portal is strictly for students. Please use the Teacher login portal.'
            }, status=status.HTTP_403_FORBIDDEN)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'message': f'Welcome back, {user.full_name}!',
            'token': token.key,
            'user': UserSerializer(user).data
        })


class TeacherLoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        password = serializer.validated_data['password']

        user = authenticate(request, username=email, password=password)
        if not user:
            return Response({'detail': 'Invalid email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

        if user.role != User.Role.TEACHER and not user.is_staff:
            return Response({
                'detail': 'Access denied. This login portal is strictly for faculty members.'
            }, status=status.HTTP_403_FORBIDDEN)

        teacher_profile = getattr(user, 'teacher_profile', None)
        token, _ = Token.objects.get_or_create(user=user)

        is_approved = bool(teacher_profile and teacher_profile.is_approved) or user.is_staff

        return Response({
            'message': f'Welcome, Prof. {user.full_name}!',
            'token': token.key,
            'user': UserSerializer(user).data,
            'is_approved': is_approved,
            'approval_note': (
                None if is_approved else
                'Your faculty account is pending verification by the administration. You will have full access once approved.'
            )
        })


class CurrentUserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({
            'user': UserSerializer(request.user).data,
            'is_approved': getattr(request.user, 'is_approved_teacher', False) or request.user.is_staff
        })


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        return Response({'message': 'Logged out successfully.'})


class AdminTeacherApprovalListView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        status_filter = request.query_params.get('status', 'all')
        queryset = TeacherProfile.objects.select_related('user').all()
        if status_filter == 'pending':
            queryset = queryset.filter(is_approved=False)
        elif status_filter == 'approved':
            queryset = queryset.filter(is_approved=True)

        results = []
        for tp in queryset:
            results.append({
                'id': tp.id,
                'full_name': tp.user.full_name,
                'email': tp.user.email,
                'employee_id': tp.employee_id,
                'department': tp.department,
                'is_approved': tp.is_approved,
                'approved_at': tp.approved_at,
                'assigned_subjects': [
                    {'id': a.subject.id, 'code': a.subject.code, 'name': a.subject.name}
                    for a in tp.subject_assignments.select_related('subject').all()
                ],
                'created_at': tp.created_at
            })
        return Response(results)


class AdminTeacherApproveRejectView(views.APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, teacher_id):
        try:
            teacher_profile = TeacherProfile.objects.get(id=teacher_id)
        except TeacherProfile.DoesNotExist:
            return Response({'detail': 'Teacher not found.'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action') # 'approve' or 'reject'
        if action == 'approve':
            teacher_profile.is_approved = True
            teacher_profile.approved_at = timezone.now()
            teacher_profile.approved_by = request.user
            teacher_profile.rejection_reason = ''
            teacher_profile.save()

            # Create notification for teacher
            from notifications.models import Notification
            Notification.objects.create(
                recipient=teacher_profile.user,
                title="Account Approved",
                message="Your faculty account has been verified and approved by the college administration. You can now access your teacher dashboard.",
                notification_type=Notification.NotificationType.TEACHER_APPROVED
            )

            return Response({
                'message': f'Teacher {teacher_profile.user.full_name} has been approved.',
                'teacher': TeacherProfileSerializer(teacher_profile).data
            })
        elif action == 'reject':
            reason = request.data.get('reason', 'Verification criteria not met.')
            teacher_profile.is_approved = False
            teacher_profile.rejection_reason = reason
            teacher_profile.save()
            return Response({
                'message': f'Teacher registration status updated to rejected.',
                'teacher': TeacherProfileSerializer(teacher_profile).data
            })
        else:
            return Response({'detail': "Invalid action. Use 'approve' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)
