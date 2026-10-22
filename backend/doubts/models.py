import uuid
from django.db import models
from django.utils import timezone
from accounts.models import User, StudentProfile, TeacherProfile
from subjects.models import Subject


class Doubt(models.Model):
    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        ANSWERED = 'ANSWERED', 'Answered'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'

    doubt_id = models.CharField(max_length=32, unique=True, db_index=True, blank=True)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='doubts')
    subject = models.ForeignKey(Subject, on_delete=models.PROTECT, related_name='doubts')
    title = models.CharField(max_length=250)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM, db_index=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    assigned_teacher = models.ForeignKey(TeacherProfile, null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_doubts')
    attachment = models.FileField(upload_to='attachments/%Y/%m/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.doubt_id:
            date_str = timezone.now().strftime('%Y%m%d')
            unique_part = uuid.uuid4().hex[:6].upper()
            self.doubt_id = f"DBT-{date_str}-{unique_part}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.doubt_id}: {self.title} ({self.status})"


class DoubtAnswer(models.Model):
    doubt = models.ForeignKey(Doubt, on_delete=models.CASCADE, related_name='answers')
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.PROTECT, related_name='answers')
    content = models.TextField()
    is_clarification_request = models.BooleanField(default=False)
    is_draft = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        label = "Clarification" if self.is_clarification_request else "Answer"
        return f"{label} by {self.teacher.user.full_name} on {self.doubt.doubt_id}"


class DoubtStatusHistory(models.Model):
    doubt = models.ForeignKey(Doubt, on_delete=models.CASCADE, related_name='status_history')
    changed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.doubt.doubt_id}: {self.old_status} -> {self.new_status}"
