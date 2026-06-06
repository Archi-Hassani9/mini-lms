"""
Mini LMS - Lesson Views
Manages lesson creation and access with enrollment checks.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Lesson
from .serializers import LessonSerializer
from courses.models import Course
from enrollments.models import Enrollment
from authentication.permissions import IsAdmin


def is_enrolled_or_admin(user, course):
    """Helper: check if user is admin or enrolled in the course."""
    if not user.is_authenticated:
        return False
    if hasattr(user, 'role') and user.role.name == 'Admin':
        return True
    return Enrollment.objects.filter(student=user, course=course).exists()


class CourseLessonsView(APIView):
    """
    GET  /api/courses/{course_id}/lessons/ - List lessons (enrolled students or admin)
    POST /api/courses/{course_id}/lessons/ - Create lesson (admin only)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not is_enrolled_or_admin(request.user, course):
            return Response(
                {'error': 'You must be enrolled in this course to view lessons.'},
                status=status.HTTP_403_FORBIDDEN
            )

        lessons = Lesson.objects.filter(course=course).order_by('order_no')
        serializer = LessonSerializer(lessons, many=True)
        return Response({'success': True, 'lessons': serializer.data})

    def post(self, request, course_id):
        # Admin only
        if not (hasattr(request.user, 'role') and request.user.role.name == 'Admin'):
            return Response({'error': 'Only admins can create lessons.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        data = {**request.data, 'course': course_id}
        serializer = LessonSerializer(data=data)
        if serializer.is_valid():
            lesson = serializer.save(course=course)
            return Response(
                {'success': True, 'message': 'Lesson created successfully.', 'lesson': LessonSerializer(lesson).data},
                status=status.HTTP_201_CREATED
            )
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class LessonDetailView(APIView):
    """
    GET    /api/lessons/{id}/ - Get lesson (enrolled or admin)
    PUT    /api/lessons/{id}/ - Update lesson (admin only)
    DELETE /api/lessons/{id}/ - Delete lesson (admin only)
    """
    permission_classes = [IsAuthenticated]

    def get_lesson(self, lesson_id):
        try:
            return Lesson.objects.select_related('course').get(id=lesson_id)
        except Lesson.DoesNotExist:
            return None

    def get(self, request, lesson_id):
        lesson = self.get_lesson(lesson_id)
        if not lesson:
            return Response({'error': 'Lesson not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not is_enrolled_or_admin(request.user, lesson.course):
            return Response(
                {'error': 'You must be enrolled in this course to view this lesson.'},
                status=status.HTTP_403_FORBIDDEN
            )

        return Response({'success': True, 'lesson': LessonSerializer(lesson).data})

    def put(self, request, lesson_id):
        if not (hasattr(request.user, 'role') and request.user.role.name == 'Admin'):
            return Response({'error': 'Only admins can update lessons.'}, status=status.HTTP_403_FORBIDDEN)

        lesson = self.get_lesson(lesson_id)
        if not lesson:
            return Response({'error': 'Lesson not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = LessonSerializer(lesson, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'message': 'Lesson updated.', 'lesson': serializer.data})
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, lesson_id):
        return self.put(request, lesson_id)

    def delete(self, request, lesson_id):
        if not (hasattr(request.user, 'role') and request.user.role.name == 'Admin'):
            return Response({'error': 'Only admins can delete lessons.'}, status=status.HTTP_403_FORBIDDEN)

        lesson = self.get_lesson(lesson_id)
        if not lesson:
            return Response({'error': 'Lesson not found.'}, status=status.HTTP_404_NOT_FOUND)

        lesson.delete()
        return Response({'success': True, 'message': 'Lesson deleted.'}, status=status.HTTP_200_OK)
