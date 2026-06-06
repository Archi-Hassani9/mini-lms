"""
Mini LMS - Lesson Serializer
"""

from rest_framework import serializers
from .models import Lesson


class LessonSerializer(serializers.ModelSerializer):
    """Full lesson serializer."""
    course_title = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'course', 'course_title', 'title', 'content', 'video_url', 'order_no', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_course_title(self, obj):
        return obj.course.title

    def validate_order_no(self, value):
        if value < 1:
            raise serializers.ValidationError("Order number must be at least 1.")
        return value

    def validate_title(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Lesson title must be at least 3 characters.")
        return value.strip()
