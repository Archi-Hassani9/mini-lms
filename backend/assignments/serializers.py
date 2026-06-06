"""
Mini LMS - Assignment and Submission Serializers
Includes file upload validation: PDF, DOCX, PPTX, ZIP only, max 200MB.
"""

import os
import uuid
import mimetypes
from rest_framework import serializers

from .models import Assignment, Submission
from enrollments.models import Enrollment

# Allowed file types for assignment submissions
ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.zip']
ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
]
MAX_UPLOAD_SIZE = 200 * 1024 * 1024  # 200MB in bytes


class AssignmentSerializer(serializers.ModelSerializer):
    """Full assignment serializer with course info."""
    course_title = serializers.SerializerMethodField()
    is_past_deadline = serializers.SerializerMethodField()
    submission_count = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            'id', 'course', 'course_title', 'title', 'description',
            'deadline', 'max_marks', 'is_past_deadline', 'submission_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_course_title(self, obj):
        return obj.course.title

    def get_is_past_deadline(self, obj):
        return obj.is_past_deadline

    def get_submission_count(self, obj):
        return obj.submissions.count()

    def validate_deadline(self, value):
        from django.utils import timezone
        if value <= timezone.now():
            raise serializers.ValidationError("Deadline must be in the future.")
        return value

    def validate_max_marks(self, value):
        if value < 1:
            raise serializers.ValidationError("Maximum marks must be at least 1.")
        return value


class SubmissionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating assignment submissions.
    Validates: file type, file size, enrollment status, duplicate prevention.
    """
    submission_file = serializers.FileField(required=True)

    class Meta:
        model = Submission
        fields = ['id', 'assignment', 'submission_file', 'submitted_at', 'status']
        read_only_fields = ['id', 'submitted_at', 'status']

    def validate_submission_file(self, value):
        """
        Validate the uploaded file:
        1. Check file extension (whitelist only)
        2. Check MIME type (prevent spoofing)
        3. Check file size (max 200MB)
        4. Reject executable files
        """
        if value is None:
            raise serializers.ValidationError("Submission file is required.")

        # Get file extension
        filename = value.name
        ext = os.path.splitext(filename)[1].lower()

        # 1. Extension whitelist check
        if ext not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                f"Invalid file type '{ext}'. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )

        # 2. MIME type validation
        mime_type = value.content_type
        if mime_type and mime_type not in ALLOWED_MIME_TYPES:
            # Also check via mimetypes library
            guessed_type, _ = mimetypes.guess_type(filename)
            if guessed_type not in ALLOWED_MIME_TYPES:
                raise serializers.ValidationError(
                    f"Invalid file type detected. Allowed: PDF, DOCX, PPTX, ZIP only."
                )

        # 3. File size check (200MB max)
        if value.size > MAX_UPLOAD_SIZE:
            size_mb = value.size / (1024 * 1024)
            raise serializers.ValidationError(
                f"File size ({size_mb:.1f} MB) exceeds the 200 MB limit."
            )

        # 4. Reject hidden executable files
        dangerous_extensions = ['.exe', '.bat', '.sh', '.cmd', '.py', '.js', '.php', '.rb']
        if ext in dangerous_extensions:
            raise serializers.ValidationError("Executable files are not allowed.")

        return value

    def validate(self, attrs):
        """Additional cross-field validation."""
        request = self.context.get('request')
        assignment = attrs.get('assignment')

        if request and assignment:
            student = request.user

            # 1. Check student is enrolled in the assignment's course
            is_enrolled = Enrollment.objects.filter(
                student=student,
                course=assignment.course
            ).exists()

            if not is_enrolled:
                raise serializers.ValidationError(
                    {'assignment': 'You must be enrolled in this course to submit assignments.'}
                )

            # 2. Check for duplicate submission
            if Submission.objects.filter(assignment=assignment, student=student).exists():
                raise serializers.ValidationError(
                    {'assignment': 'You have already submitted this assignment.'}
                )

            # 3. Check deadline
            if assignment.is_past_deadline:
                raise serializers.ValidationError(
                    {'assignment': 'The deadline for this assignment has passed.'}
                )

        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['student'] = request.user
        return super().create(validated_data)


class SubmissionDetailSerializer(serializers.ModelSerializer):
    """Detailed submission serializer for admin view."""
    assignment_title = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = [
            'id', 'assignment', 'assignment_title', 'course_title',
            'student', 'student_name', 'student_email',
            'file_url', 'submitted_at', 'status'
        ]
        read_only_fields = ['id', 'submitted_at', 'assignment', 'student', 'file_url']

    def get_assignment_title(self, obj):
        return obj.assignment.title

    def get_course_title(self, obj):
        return obj.assignment.course.title

    def get_student_name(self, obj):
        return obj.student.full_name

    def get_student_email(self, obj):
        return obj.student.email

    def get_file_url(self, obj):
        if obj.submission_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.submission_file.url)
            return obj.submission_file.url
        return None
