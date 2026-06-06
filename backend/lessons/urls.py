"""
Mini LMS - Lessons URL Configuration
"""

from django.urls import path
from .views import CourseLessonsView, LessonDetailView

urlpatterns = [
    path('courses/<int:course_id>/lessons/', CourseLessonsView.as_view(), name='course-lessons'),
    path('lessons/<int:lesson_id>/', LessonDetailView.as_view(), name='lesson-detail'),
]
