from django.urls import path
from .views import (
    StudentRegisterView,
    TeacherRegisterView,
    StudentLoginView,
    TeacherLoginView,
    CurrentUserView,
    LogoutView,
    AdminTeacherApprovalListView,
    AdminTeacherApproveRejectView
)

urlpatterns = [
    path('register/student/', StudentRegisterView.as_view(), name='register-student'),
    path('register/teacher/', TeacherRegisterView.as_view(), name='register-teacher'),
    path('login/student/', StudentLoginView.as_view(), name='login-student'),
    path('login/teacher/', TeacherLoginView.as_view(), name='login-teacher'),
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('admin/teachers/', AdminTeacherApprovalListView.as_view(), name='admin-teachers-list'),
    path('admin/teachers/<int:teacher_id>/action/', AdminTeacherApproveRejectView.as_view(), name='admin-teacher-action'),
]
