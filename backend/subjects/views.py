from rest_framework import generics, permissions
from .models import Subject, TeacherSubject
from .serializers import SubjectSerializer, TeacherSubjectSerializer
from accounts.permissions import IsAdminUser


class SubjectListView(generics.ListCreateAPIView):
    serializer_class = SubjectSerializer
    pagination_class = None  # Return all subjects for dropdowns

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdminUser()]

    def get_queryset(self):
        queryset = Subject.objects.filter(is_active=True)
        dept = self.request.query_params.get('department')
        if dept:
            queryset = queryset.filter(department__iexact=dept)
        return queryset


class SubjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdminUser()]
