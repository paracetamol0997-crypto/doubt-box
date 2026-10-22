from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    message = "Access restricted to registered students."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'STUDENT' and
            hasattr(request.user, 'student_profile')
        )


class IsApprovedTeacher(permissions.BasePermission):
    message = "Access restricted to approved faculty members."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'TEACHER' and
            hasattr(request.user, 'teacher_profile') and
            request.user.teacher_profile.is_approved
        )


class IsTeacher(permissions.BasePermission):
    """Allows teachers (whether pending approval or approved) to access basic profile/status endpoints."""
    message = "Access restricted to registered teachers."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'TEACHER' and
            hasattr(request.user, 'teacher_profile')
        )


class IsAdminUser(permissions.BasePermission):
    message = "Access restricted to system administrators."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.is_staff or request.user.role == 'ADMIN')
        )
