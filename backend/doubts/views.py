from django.db.models import Q, Count
from django.db import transaction
from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from .models import Doubt, DoubtAnswer, DoubtStatusHistory
from .serializers import (
    DoubtListSerializer,
    DoubtDetailSerializer,
    DoubtCreateSerializer,
    DoubtAnswerCreateSerializer,
    DoubtAnswerSerializer
)
from accounts.permissions import IsStudent, IsApprovedTeacher
from notifications.services import broadcast_new_doubt_to_teachers, notify_user
from notifications.models import Notification


class StudentDoubtListCreateView(views.APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        student = request.user.student_profile
        queryset = Doubt.objects.filter(student=student).select_related('subject', 'student__user')

        # Filters
        subject_id = request.query_params.get('subject')
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)

        status_val = request.query_params.get('status')
        if status_val:
            queryset = queryset.filter(status=status_val.upper())

        priority = request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority.upper())

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(doubt_id__icontains=search)
            )

        ordering = request.query_params.get('ordering', '-created_at')
        if ordering in ['created_at', '-created_at', 'status', '-status']:
            queryset = queryset.order_by(ordering)

        serializer = DoubtListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request):
        serializer = DoubtCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            with transaction.atomic():
                doubt = serializer.save()
                # Broadcast real-time and persistent notification to authorized teachers
                broadcast_new_doubt_to_teachers(doubt)

            detail_serializer = DoubtDetailSerializer(doubt, context={'request': request})
            return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StudentDoubtDetailView(views.APIView):
    permission_classes = [IsStudent]

    def get(self, request, doubt_id):
        student = request.user.student_profile
        try:
            doubt = Doubt.objects.select_related('subject', 'student__user').prefetch_related(
                'answers__teacher__user', 'status_history__changed_by'
            ).get(doubt_id=doubt_id, student=student)
        except Doubt.DoesNotExist:
            return Response({'detail': 'Doubt not found or access denied.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = DoubtDetailSerializer(doubt, context={'request': request})
        return Response(serializer.data)


class StudentDashboardStatsView(views.APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        student = request.user.student_profile
        doubts = Doubt.objects.filter(student=student)

        total = doubts.count()
        pending = doubts.filter(status=Doubt.Status.PENDING).count()
        in_progress = doubts.filter(status=Doubt.Status.IN_PROGRESS).count()
        answered = doubts.filter(status=Doubt.Status.ANSWERED).count()
        resolved = doubts.filter(status__in=[Doubt.Status.RESOLVED, Doubt.Status.CLOSED]).count()

        recent = doubts.select_related('subject').order_by('-created_at')[:5]
        recent_data = DoubtListSerializer(recent, many=True, context={'request': request}).data

        return Response({
            'total': total,
            'pending': pending,
            'in_progress': in_progress,
            'answered': answered,
            'resolved': resolved,
            'recent_doubts': recent_data
        })


def get_teacher_accessible_doubts(teacher):
    assigned_subject_ids = teacher.subject_assignments.values_list('subject_id', flat=True)
    if assigned_subject_ids:
        # Teachers can see doubts for assigned subjects OR department subjects
        return Doubt.objects.filter(
            Q(subject_id__in=assigned_subject_ids) |
            Q(subject__department__iexact=teacher.department)
        )
    else:
        # If no explicit assignment yet, fall back to department subjects
        return Doubt.objects.filter(subject__department__iexact=teacher.department)


class TeacherDoubtInboxView(views.APIView):
    permission_classes = [IsApprovedTeacher]

    def get(self, request):
        teacher = request.user.teacher_profile
        queryset = get_teacher_accessible_doubts(teacher).select_related(
            'subject', 'student__user'
        )

        # Filters
        subject_id = request.query_params.get('subject')
        if subject_id:
            queryset = queryset.filter(subject_id=subject_id)

        status_val = request.query_params.get('status')
        if status_val:
            queryset = queryset.filter(status=status_val.upper())

        priority = request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority.upper())

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(doubt_id__icontains=search) |
                Q(student__register_number__icontains=search) |
                Q(student__user__full_name__icontains=search)
            )

        ordering = request.query_params.get('ordering', '-created_at')
        if ordering in ['created_at', '-created_at', 'priority', '-priority', 'status', '-status']:
            queryset = queryset.order_by(ordering)

        serializer = DoubtListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)


class TeacherDoubtDetailView(views.APIView):
    permission_classes = [IsApprovedTeacher]

    def get(self, request, doubt_id):
        teacher = request.user.teacher_profile
        try:
            doubt = get_teacher_accessible_doubts(teacher).select_related(
                'subject', 'student__user'
            ).prefetch_related(
                'answers__teacher__user', 'status_history__changed_by'
            ).get(doubt_id=doubt_id)
        except Doubt.DoesNotExist:
            return Response(
                {'detail': 'Doubt not found or you are not authorized to access doubts for this subject/department.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = DoubtDetailSerializer(doubt, context={'request': request})
        return Response(serializer.data)


class TeacherAnswerDoubtView(views.APIView):
    permission_classes = [IsApprovedTeacher]

    def post(self, request, doubt_id):
        teacher = request.user.teacher_profile
        try:
            doubt = get_teacher_accessible_doubts(teacher).get(doubt_id=doubt_id)
        except Doubt.DoesNotExist:
            return Response({'detail': 'Doubt not found or access denied.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = DoubtAnswerCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        content = serializer.validated_data['content'].strip()
        is_clarification = serializer.validated_data['is_clarification_request']
        new_status = serializer.validated_data.get('new_status')

        if is_clarification:
            new_status = Doubt.Status.IN_PROGRESS
        elif not new_status:
            new_status = Doubt.Status.ANSWERED

        with transaction.atomic():
            # Save answer
            answer = DoubtAnswer.objects.create(
                doubt=doubt,
                teacher=teacher,
                content=content,
                is_clarification_request=is_clarification
            )

            # Update doubt status & assigned teacher
            old_status = doubt.status
            doubt.status = new_status
            doubt.assigned_teacher = teacher
            doubt.save()

            # Record history
            action_desc = "Teacher requested clarification." if is_clarification else "Teacher submitted an answer."
            DoubtStatusHistory.objects.create(
                doubt=doubt,
                changed_by=request.user,
                old_status=old_status,
                new_status=new_status,
                comment=action_desc
            )

            # Notify the student
            notification_type = (
                Notification.NotificationType.CLARIFICATION_REQUESTED
                if is_clarification else
                Notification.NotificationType.DOUBT_ANSWERED
            )
            title = (
                f"Clarification needed on {doubt.doubt_id}"
                if is_clarification else
                f"Doubt answered: {doubt.doubt_id}"
            )
            message = (
                f"Prof. {teacher.user.full_name} asked for clarification on \"{doubt.title}\""
                if is_clarification else
                f"Prof. {teacher.user.full_name} answered your doubt \"{doubt.title}\""
            )

            notify_user(
                user=doubt.student.user,
                title=title,
                message=message,
                notification_type=notification_type,
                related_doubt=doubt
            )

        updated_doubt = Doubt.objects.prefetch_related(
            'answers__teacher__user', 'status_history__changed_by'
        ).get(id=doubt.id)
        return Response(DoubtDetailSerializer(updated_doubt, context={'request': request}).data)


class TeacherUpdateStatusView(views.APIView):
    permission_classes = [IsApprovedTeacher]

    def post(self, request, doubt_id):
        teacher = request.user.teacher_profile
        try:
            doubt = get_teacher_accessible_doubts(teacher).get(doubt_id=doubt_id)
        except Doubt.DoesNotExist:
            return Response({'detail': 'Doubt not found or access denied.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        comment = request.data.get('comment', '').strip()

        if new_status not in [choice[0] for choice in Doubt.Status.choices]:
            return Response({'detail': f'Invalid status: {new_status}'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = doubt.status
        if old_status == new_status:
            return Response({'detail': 'Status is already set to this value.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            doubt.status = new_status
            doubt.assigned_teacher = teacher
            doubt.save()

            DoubtStatusHistory.objects.create(
                doubt=doubt,
                changed_by=request.user,
                old_status=old_status,
                new_status=new_status,
                comment=comment or f"Status changed to {new_status}"
            )

            notify_user(
                user=doubt.student.user,
                title=f"Status updated: {doubt.doubt_id}",
                message=f"Status for \"{doubt.title}\" changed to {new_status} by Prof. {teacher.user.full_name}",
                notification_type=Notification.NotificationType.STATUS_UPDATED,
                related_doubt=doubt
            )

        return Response({
            'message': f'Status updated to {new_status}',
            'doubt': DoubtDetailSerializer(doubt, context={'request': request}).data
        })


class TeacherDashboardStatsView(views.APIView):
    permission_classes = [IsApprovedTeacher]

    def get(self, request):
        teacher = request.user.teacher_profile
        doubts = get_teacher_accessible_doubts(teacher)

        total = doubts.count()
        pending = doubts.filter(status=Doubt.Status.PENDING).count()
        in_progress = doubts.filter(status=Doubt.Status.IN_PROGRESS).count()
        answered = doubts.filter(status=Doubt.Status.ANSWERED).count()
        resolved = doubts.filter(status__in=[Doubt.Status.RESOLVED, Doubt.Status.CLOSED]).count()

        # Subject wise breakdown
        subject_counts = doubts.values('subject__code', 'subject__name').annotate(
            count=Count('id')
        ).order_by('-count')[:5]

        recent = doubts.select_related('subject', 'student__user').order_by('-created_at')[:5]
        recent_data = DoubtListSerializer(recent, many=True, context={'request': request}).data

        return Response({
            'total': total,
            'pending': pending,
            'in_progress': in_progress,
            'answered': answered,
            'resolved': resolved,
            'subject_breakdown': subject_counts,
            'recent_doubts': recent_data
        })
