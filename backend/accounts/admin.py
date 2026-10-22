from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, StudentProfile, TeacherProfile


class StudentProfileInline(admin.StackedInline):
    model = StudentProfile
    can_delete = False
    verbose_name_plural = 'Student Profile'


class TeacherProfileInline(admin.StackedInline):
    model = TeacherProfile
    can_delete = False
    verbose_name_plural = 'Teacher Profile'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'full_name', 'role', 'is_staff', 'is_active', 'created_at')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('email', 'full_name')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at')


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('register_number', 'user_full_name', 'department', 'year_of_study', 'created_at')
    search_fields = ('register_number', 'user__full_name', 'user__email', 'department')
    list_filter = ('department', 'year_of_study')

    def user_full_name(self, obj):
        return obj.user.full_name
    user_full_name.short_description = 'Student Name'


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'user_full_name', 'department', 'is_approved', 'approved_at', 'created_at')
    list_filter = ('is_approved', 'department')
    search_fields = ('employee_id', 'user__full_name', 'user__email', 'department')
    actions = ['approve_teachers', 'reject_teachers']

    def user_full_name(self, obj):
        return obj.user.full_name
    user_full_name.short_description = 'Faculty Name'

    @admin.action(description="Approve selected teacher registrations")
    def approve_teachers(self, request, queryset):
        from django.utils import timezone
        queryset.update(is_approved=True, approved_at=timezone.now(), approved_by=request.user)

    @admin.action(description="Revoke approval for selected teachers")
    def reject_teachers(self, request, queryset):
        queryset.update(is_approved=False)
