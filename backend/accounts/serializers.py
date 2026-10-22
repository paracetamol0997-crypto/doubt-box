from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import User, StudentProfile, TeacherProfile
from subjects.models import Subject, TeacherSubject


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['register_number', 'department', 'year_of_study', 'created_at']


class TeacherProfileSerializer(serializers.ModelSerializer):
    assigned_subjects = serializers.SerializerMethodField()

    class Meta:
        model = TeacherProfile
        fields = ['employee_id', 'department', 'is_approved', 'approved_at', 'rejection_reason', 'assigned_subjects', 'created_at']

    def get_assigned_subjects(self, obj):
        assignments = obj.subject_assignments.select_related('subject').all()
        return [
            {
                'id': a.subject.id,
                'code': a.subject.code,
                'name': a.subject.name,
                'department': a.subject.department
            }
            for a in assignments
        ]


class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True)
    teacher_profile = TeacherProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'student_profile', 'teacher_profile', 'created_at']


class StudentRegistrationSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    register_number = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    department = serializers.CharField(max_length=100)
    year_of_study = serializers.IntegerField(min_value=1, max_value=6, default=1)
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate_register_number(self, value):
        val = value.strip().upper()
        if StudentProfile.objects.filter(register_number__iexact=val).exists():
            raise serializers.ValidationError("A student with this register number already exists.")
        return val

    def validate_email(self, value):
        val = value.strip().lower()
        if User.objects.filter(email__iexact=val).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return val

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': "Passwords do not match."})
        validate_password(data['password'])
        return data

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            role=User.Role.STUDENT,
        )
        student_profile = StudentProfile.objects.create(
            user=user,
            register_number=validated_data['register_number'],
            department=validated_data['department'],
            year_of_study=validated_data['year_of_study'],
        )
        return user


class TeacherRegistrationSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    employee_id = serializers.CharField(max_length=50)
    department = serializers.CharField(max_length=100)
    subject_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True, min_length=6)

    def validate_employee_id(self, value):
        val = value.strip().upper()
        if TeacherProfile.objects.filter(employee_id__iexact=val).exists():
            raise serializers.ValidationError("A faculty member with this employee ID already exists.")
        return val

    def validate_email(self, value):
        val = value.strip().lower()
        if User.objects.filter(email__iexact=val).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return val

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': "Passwords do not match."})
        validate_password(data['password'])
        return data

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            role=User.Role.TEACHER,
        )
        teacher_profile = TeacherProfile.objects.create(
            user=user,
            employee_id=validated_data['employee_id'],
            department=validated_data['department'],
            is_approved=False,  # Security requirement: pending approval!
        )
        subject_ids = validated_data.get('subject_ids', [])
        if subject_ids:
            subjects = Subject.objects.filter(id__in=subject_ids)
            for sub in subjects:
                TeacherSubject.objects.create(teacher=teacher_profile, subject=sub)

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
