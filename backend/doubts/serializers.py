from rest_framework import serializers
from .models import Doubt, DoubtAnswer, DoubtStatusHistory
from subjects.serializers import SubjectSerializer
from subjects.models import Subject


class DoubtStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source='changed_by.full_name', read_only=True, default='System')

    class Meta:
        model = DoubtStatusHistory
        fields = ['id', 'changed_by_name', 'old_status', 'new_status', 'comment', 'created_at']


class DoubtAnswerSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.user.full_name', read_only=True)
    teacher_department = serializers.CharField(source='teacher.department', read_only=True)

    class Meta:
        model = DoubtAnswer
        fields = [
            'id',
            'teacher_name',
            'teacher_department',
            'content',
            'is_clarification_request',
            'created_at',
            'updated_at'
        ]


class DoubtDetailSerializer(serializers.ModelSerializer):
    subject = SubjectSerializer(read_only=True)
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_register_number = serializers.SerializerMethodField()
    student_department = serializers.CharField(source='student.department', read_only=True)
    student_year = serializers.IntegerField(source='student.year_of_study', read_only=True)
    answers = DoubtAnswerSerializer(many=True, read_only=True)
    status_history = DoubtStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Doubt
        fields = [
            'id',
            'doubt_id',
            'title',
            'description',
            'priority',
            'status',
            'subject',
            'student_name',
            'student_register_number',
            'student_department',
            'student_year',
            'answers',
            'status_history',
            'created_at',
            'updated_at'
        ]

    def get_student_register_number(self, obj):
        # Only expose register number to teachers and admin or the student themselves
        user = self.context.get('request').user if 'request' in self.context else None
        if user and (user.is_teacher or user.is_staff or (user.is_student and user.student_profile == obj.student)):
            return obj.student.register_number
        return None


class DoubtListSerializer(serializers.ModelSerializer):
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    student_name = serializers.CharField(source='student.user.full_name', read_only=True)
    student_register_number = serializers.SerializerMethodField()
    answers_count = serializers.IntegerField(source='answers.count', read_only=True)

    class Meta:
        model = Doubt
        fields = [
            'id',
            'doubt_id',
            'title',
            'priority',
            'status',
            'subject_code',
            'subject_name',
            'student_name',
            'student_register_number',
            'answers_count',
            'created_at',
            'updated_at'
        ]

    def get_student_register_number(self, obj):
        user = self.context.get('request').user if 'request' in self.context else None
        if user and (user.is_teacher or user.is_staff or (user.is_student and user.student_profile == obj.student)):
            return obj.student.register_number
        return None


class DoubtCreateSerializer(serializers.Serializer):
    subject_id = serializers.IntegerField()
    title = serializers.CharField(max_length=250, min_length=5)
    description = serializers.CharField(min_length=10)
    priority = serializers.ChoiceField(choices=Doubt.Priority.choices, default=Doubt.Priority.MEDIUM)

    def validate_subject_id(self, value):
        if not Subject.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Selected subject does not exist or is inactive.")
        return value

    def create(self, validated_data):
        student = self.context['request'].user.student_profile
        subject = Subject.objects.get(id=validated_data['subject_id'])
        doubt = Doubt.objects.create(
            student=student,
            subject=subject,
            title=validated_data['title'].strip(),
            description=validated_data['description'].strip(),
            priority=validated_data.get('priority', Doubt.Priority.MEDIUM),
            status=Doubt.Status.PENDING
        )
        DoubtStatusHistory.objects.create(
            doubt=doubt,
            changed_by=self.context['request'].user,
            old_status='NONE',
            new_status=Doubt.Status.PENDING,
            comment='Doubt submitted by student.'
        )
        return doubt


class DoubtAnswerCreateSerializer(serializers.Serializer):
    content = serializers.CharField(min_length=5)
    is_clarification_request = serializers.BooleanField(default=False)
    new_status = serializers.ChoiceField(
        choices=Doubt.Status.choices,
        required=False,
        default=Doubt.Status.ANSWERED
    )
