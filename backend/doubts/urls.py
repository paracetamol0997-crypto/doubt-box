from django.urls import path
from .views import (
    StudentDoubtListCreateView,
    StudentDoubtDetailView,
    StudentDashboardStatsView,
    TeacherDoubtInboxView,
    TeacherDoubtDetailView,
    TeacherAnswerDoubtView,
    TeacherUpdateStatusView,
    TeacherDashboardStatsView
)

urlpatterns = [
    # Student endpoints
    path('student/', StudentDoubtListCreateView.as_view(), name='student-doubts'),
    path('student/stats/', StudentDashboardStatsView.as_view(), name='student-stats'),
    path('student/<str:doubt_id>/', StudentDoubtDetailView.as_view(), name='student-doubt-detail'),

    # Teacher endpoints
    path('teacher/', TeacherDoubtInboxView.as_view(), name='teacher-doubts'),
    path('teacher/stats/', TeacherDashboardStatsView.as_view(), name='teacher-stats'),
    path('teacher/<str:doubt_id>/', TeacherDoubtDetailView.as_view(), name='teacher-doubt-detail'),
    path('teacher/<str:doubt_id>/answer/', TeacherAnswerDoubtView.as_view(), name='teacher-doubt-answer'),
    path('teacher/<str:doubt_id>/status/', TeacherUpdateStatusView.as_view(), name='teacher-doubt-status'),
]
