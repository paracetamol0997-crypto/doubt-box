from django.contrib import admin
from .models import Doubt, DoubtAnswer, DoubtStatusHistory


class DoubtAnswerInline(admin.StackedInline):
    model = DoubtAnswer
    extra = 0
    readonly_fields = ('created_at', 'updated_at')


class DoubtStatusHistoryInline(admin.TabularInline):
    model = DoubtStatusHistory
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(Doubt)
class DoubtAdmin(admin.ModelAdmin):
    list_display = ('doubt_id', 'title', 'subject', 'student_name', 'status', 'priority', 'created_at')
    list_filter = ('status', 'priority', 'subject__department')
    search_fields = ('doubt_id', 'title', 'description', 'student__user__full_name', 'student__register_number')
    readonly_fields = ('doubt_id', 'created_at', 'updated_at')
    inlines = [DoubtAnswerInline, DoubtStatusHistoryInline]

    def student_name(self, obj):
        return f"{obj.student.user.full_name} ({obj.student.register_number})"
    student_name.short_description = 'Student'


@admin.register(DoubtAnswer)
class DoubtAnswerAdmin(admin.ModelAdmin):
    list_display = ('doubt', 'teacher', 'is_clarification_request', 'created_at')
    list_filter = ('is_clarification_request',)
    search_fields = ('doubt__doubt_id', 'content', 'teacher__user__full_name')


@admin.register(DoubtStatusHistory)
class DoubtStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ('doubt', 'changed_by', 'old_status', 'new_status', 'created_at')
    list_filter = ('new_status',)
    search_fields = ('doubt__doubt_id', 'comment')
