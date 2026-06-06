"""
Mini LMS - Course Serializers
"""

from rest_framework import serializers
from .models import Course


class CourseListSerializer(serializers.ModelSerializer):
    """Serializer for course list view - includes computed counts."""
    lesson_count = serializers.SerializerMethodField()
    enrollment_count = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail', 'category',
            'created_by_name', 'lesson_count', 'enrollment_count', 'created_at'
        ]

    def get_lesson_count(self, obj):
        return obj.lessons.count()

    def get_enrollment_count(self, obj):
        return obj.enrollments.count()

    def get_created_by_name(self, obj):
        return obj.created_by.full_name


class CourseDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer with lessons and enrollment status."""
    from lessons.serializers import LessonSerializer
    lessons = serializers.SerializerMethodField()
    lesson_count = serializers.SerializerMethodField()
    enrollment_count = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail', 'category',
            'created_by', 'created_by_name', 'lesson_count', 'enrollment_count',
            'is_enrolled', 'lessons', 'created_at', 'updated_at'
        ]

    def get_lessons(self, obj):
        from lessons.serializers import LessonSerializer
        lessons = obj.lessons.order_by('order_no')
        return LessonSerializer(lessons, many=True).data

    def get_lesson_count(self, obj):
        return obj.lessons.count()

    def get_enrollment_count(self, obj):
        return obj.enrollments.count()

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.enrollments.filter(student=request.user).exists()
        return False

    def get_created_by_name(self, obj):
        return obj.created_by.full_name


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin course creation and updates."""

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'thumbnail', 'category']

    def validate_title(self, value):
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Course title must be at least 5 characters.")
        return value.strip()

    def validate_description(self, value):
        if len(value.strip()) < 20:
            raise serializers.ValidationError("Course description must be at least 20 characters.")
        return value.strip()

    def create(self, validated_data):
        # Set created_by from request context
        request = self.context.get('request')
        validated_data['created_by'] = request.user
        return super().create(validated_data)
