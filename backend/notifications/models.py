from django.db import models
from accounts.models import User
from doubts.models import Doubt


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        NEW_DOUBT = 'NEW_DOUBT', 'New Doubt Submitted'
        DOUBT_ANSWERED = 'DOUBT_ANSWERED', 'Doubt Answered'
        CLARIFICATION_REQUESTED = 'CLARIFICATION_REQUESTED', 'Clarification Requested'
        STATUS_UPDATED = 'STATUS_UPDATED', 'Status Updated'
        TEACHER_APPROVED = 'TEACHER_APPROVED', 'Teacher Approved'
        SYSTEM = 'SYSTEM', 'System Notification'

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=40,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
        db_index=True
    )
    related_doubt = models.ForeignKey(
        Doubt,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='notifications'
    )
    is_read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        status = "Read" if self.is_read else "Unread"
        return f"[{status}] {self.title} to {self.recipient.email}"
