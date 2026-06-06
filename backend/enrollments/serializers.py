"""
Mini LMS - Enrollment and Progress Serializers
"""

from rest_framework import serializers
from .models import Enrollment, Progress
from courses.serializers import CourseListSerializer


class EnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for enrollment with nested course info."""
    course_detail = CourseListSerializer(source='course', read_only=True)
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_name', 'student_email', 'course', 'course_detail', 'progress_percentage', 'enrolled_at']
        read_only_fields = ['id', 'enrolled_at', 'student']

    def get_student_name(self, obj):
        return obj.student.full_name

    def get_student_email(self, obj):
        return obj.student.email

    def get_progress_percentage(self, obj):
        try:
            progress = Progress.objects.get(student=obj.student, course=obj.course)
            return float(progress.percentage)
        except Progress.DoesNotExist:
            return 0.0

    def validate(self, attrs):
        request = self.context.get('request')
        if request:
            course = attrs.get('course')
            student = request.user
            if Enrollment.objects.filter(student=student, course=course).exists():
                raise serializers.ValidationError(
                    {'course': 'You are already enrolled in this course.'}
                )
        return attrs

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['student'] = request.user
        enrollment = super().create(validated_data)

        # Create initial progress record
        Progress.objects.get_or_create(
            student=request.user,
            course=validated_data['course'],
            defaults={'percentage': 0.00}
        )
        return enrollment


class ProgressSerializer(serializers.ModelSerializer):
    """Serializer for progress tracking."""
    course_title = serializers.SerializerMethodField()

    class Meta:
        model = Progress
        fields = ['id', 'student', 'course', 'course_title', 'percentage', 'last_updated']
        read_only_fields = ['id', 'student', 'course', 'last_updated']

    def get_course_title(self, obj):
        return obj.course.title

    def validate_percentage(self, value):
        if not (0 <= float(value) <= 100):
            raise serializers.ValidationError("Progress percentage must be between 0 and 100.")
        return value
