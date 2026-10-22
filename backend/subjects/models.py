from django.db import models
from accounts.models import TeacherProfile


class Subject(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=30, unique=True, db_index=True)
    department = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['code', 'name']

    def save(self, *args, **kwargs):
        if self.code:
            self.code = self.code.strip().upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.code} - {self.name} ({self.department})"


class TeacherSubject(models.Model):
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE, related_name='subject_assignments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='teacher_assignments')
    is_primary = models.BooleanField(default=False)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('teacher', 'subject')
        ordering = ['subject__code']

    def __str__(self):
        return f"{self.teacher.user.full_name} -> {self.subject.code}"
