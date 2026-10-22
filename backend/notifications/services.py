from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import Notification
from accounts.models import TeacherProfile
from subjects.models import TeacherSubject


def notify_user(user, title, message, notification_type, related_doubt=None):
    """
    Persist notification to database and emit real-time WebSocket event to user channel.
    """
    notification = Notification.objects.create(
        recipient=user,
        title=title,
        message=message,
        notification_type=notification_type,
        related_doubt=related_doubt
    )

    channel_layer = get_channel_layer()
    if channel_layer:
        payload = {
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'notification_type': notification.notification_type,
            'related_doubt_id': related_doubt.doubt_id if related_doubt else None,
            'is_read': notification.is_read,
            'created_at': notification.created_at.isoformat()
        }
        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}",
            {
                'type': 'send_notification',
                'notification': payload
            }
        )
    return notification


def broadcast_new_doubt_to_teachers(doubt):
    """
    When a student submits a doubt, find authorized & approved teachers for that subject
    (or department) and deliver persistent notifications and real-time alerts.
    """
    channel_layer = get_channel_layer()

    # 1. Look for teachers specifically assigned to this subject
    assigned_teachers = TeacherProfile.objects.filter(
        is_approved=True,
        subject_assignments__subject=doubt.subject
    ).select_related('user').distinct()

    # 2. If none found, look for approved teachers in the same department
    if not assigned_teachers.exists():
        assigned_teachers = TeacherProfile.objects.filter(
            is_approved=True,
            department__iexact=doubt.subject.department
        ).select_related('user').distinct()

    # 3. If still none found, notify all approved teachers so no doubt is lost
    if not assigned_teachers.exists():
        assigned_teachers = TeacherProfile.objects.filter(
            is_approved=True
        ).select_related('user').distinct()

    for teacher in assigned_teachers:
        title = f"New Doubt in {doubt.subject.code}"
        message = f"Student {doubt.student.user.full_name} submitted a new question: \"{doubt.title}\""
        notification = Notification.objects.create(
            recipient=teacher.user,
            title=title,
            message=message,
            notification_type=Notification.NotificationType.NEW_DOUBT,
            related_doubt=doubt
        )

        if channel_layer:
            payload = {
                'id': notification.id,
                'title': notification.title,
                'message': notification.message,
                'notification_type': notification.notification_type,
                'related_doubt_id': doubt.doubt_id,
                'subject_code': doubt.subject.code,
                'subject_name': doubt.subject.name,
                'doubt_title': doubt.title,
                'doubt_priority': doubt.priority,
                'is_read': False,
                'created_at': notification.created_at.isoformat()
            }
            async_to_sync(channel_layer.group_send)(
                f"user_{teacher.user.id}",
                {
                    'type': 'send_notification',
                    'notification': payload
                }
            )

    # Also broadcast generic doubt update to teachers_group for inbox refresh
    if channel_layer:
        async_to_sync(channel_layer.group_send)(
            "teachers_group",
            {
                'type': 'doubt_update',
                'data': {
                    'action': 'created',
                    'doubt_id': doubt.doubt_id,
                    'subject_id': doubt.subject.id,
                    'subject_code': doubt.subject.code,
                    'title': doubt.title,
                    'priority': doubt.priority,
                    'status': doubt.status
                }
            }
        )
