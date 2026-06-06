"""
Mini LMS - Enrollment Views
Handles enrollment, my-enrollments, all-enrollments, and progress tracking.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Enrollment, Progress
from .serializers import EnrollmentSerializer, ProgressSerializer
from courses.models import Course
from authentication.permissions import IsAdmin, IsStudent
from notifications.services import send_enrollment_confirmation


class EnrollView(APIView):
    """
    POST /api/enrollments/
    Student only - Enroll in a course. Prevents duplicate enrollments.
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        serializer = EnrollmentSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            enrollment = serializer.save()
            # Send confirmation email
            try:
                send_enrollment_confirmation(request.user, enrollment.course)
            except Exception:
                pass

            return Response(
                {
                    'success': True,
                    'message': f'Successfully enrolled in "{enrollment.course.title}".',
                    'enrollment': EnrollmentSerializer(enrollment, context={'request': request}).data,
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {'success': False, 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )


class MyEnrollmentsView(APIView):
    """
    GET /api/enrollments/my/
    Student - Get their own enrollments with progress.
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        enrollments = Enrollment.objects.filter(student=request.user).select_related('course', 'course__created_by')
        serializer = EnrollmentSerializer(enrollments, many=True, context={'request': request})
        return Response(
            {'success': True, 'enrollments': serializer.data, 'count': enrollments.count()},
            status=status.HTTP_200_OK
        )


class AllEnrollmentsView(APIView):
    """
    GET /api/enrollments/
    Admin only - View all enrollments.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        enrollments = Enrollment.objects.all().select_related(
            'student', 'course', 'course__created_by'
        ).order_by('-enrolled_at')

        # Filter by course or student if requested
        course_id = request.query_params.get('course_id')
        student_id = request.query_params.get('student_id')

        if course_id:
            enrollments = enrollments.filter(course_id=course_id)
        if student_id:
            enrollments = enrollments.filter(student_id=student_id)

        serializer = EnrollmentSerializer(enrollments, many=True, context={'request': request})
        return Response(
            {'success': True, 'enrollments': serializer.data, 'count': enrollments.count()},
            status=status.HTTP_200_OK
        )


class UpdateProgressView(APIView):
    """
    PUT /api/progress/{course_id}/
    Student - Update their own progress in an enrolled course.
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def put(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check enrollment
        if not Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response(
                {'error': 'You are not enrolled in this course.'},
                status=status.HTTP_403_FORBIDDEN
            )

        progress, _ = Progress.objects.get_or_create(
            student=request.user,
            course=course,
            defaults={'percentage': 0.00}
        )

        serializer = ProgressSerializer(progress, data={'percentage': request.data.get('percentage', 0)}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'success': True, 'message': 'Progress updated.', 'progress': serializer.data}
            )
        return Response(
            {'success': False, 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )
