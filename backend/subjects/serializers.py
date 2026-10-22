from rest_framework import serializers
from .models import Subject, TeacherSubject


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'department', 'description', 'is_active', 'created_at']


class TeacherSubjectSerializer(serializers.ModelSerializer):
    subject_details = SubjectSerializer(source='subject', read_only=True)

    class Meta:
        model = TeacherSubject
        fields = ['id', 'teacher', 'subject', 'subject_details', 'is_primary', 'assigned_at']
