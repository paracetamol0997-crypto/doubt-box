from django.contrib import admin
from .models import Subject, TeacherSubject


class TeacherSubjectInline(admin.TabularInline):
    model = TeacherSubject
    extra = 1


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'department', 'is_active', 'created_at')
    list_filter = ('department', 'is_active')
    search_fields = ('code', 'name', 'department')
    inlines = [TeacherSubjectInline]


@admin.register(TeacherSubject)
class TeacherSubjectAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'subject', 'is_primary', 'assigned_at')
    list_filter = ('is_primary', 'subject__department')
    search_fields = ('teacher__user__full_name', 'subject__code', 'subject__name')
