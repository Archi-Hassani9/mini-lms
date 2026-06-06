"""
Mini LMS - Assignment and Submission Views
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Assignment, Submission
from .serializers import AssignmentSerializer, SubmissionCreateSerializer, SubmissionDetailSerializer
from courses.models import Course
from enrollments.models import Enrollment
from authentication.permissions import IsAdmin, IsStudent
from notifications.services import send_assignment_submission_notification, send_submission_reviewed_notification


def is_enrolled_or_admin(user, course):
    if hasattr(user, 'role') and user.role.name == 'Admin':
        return True
    return Enrollment.objects.filter(student=user, course=course).exists()


class CourseAssignmentsView(APIView):
    """
    GET  /api/courses/{course_id}/assignments/ - List (enrolled or admin)
    POST /api/courses/{course_id}/assignments/ - Create (admin only)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not is_enrolled_or_admin(request.user, course):
            return Response({'error': 'You must be enrolled to view assignments.'}, status=status.HTTP_403_FORBIDDEN)

        assignments = Assignment.objects.filter(course=course).order_by('deadline')
        serializer = AssignmentSerializer(assignments, many=True)
        return Response({'success': True, 'assignments': serializer.data})

    def post(self, request, course_id):
        if not (hasattr(request.user, 'role') and request.user.role.name == 'Admin'):
            return Response({'error': 'Only admins can create assignments.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'error': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        data = {**request.data, 'course': course_id}
        serializer = AssignmentSerializer(data=data)
        if serializer.is_valid():
            assignment = serializer.save(course=course)
            return Response(
                {'success': True, 'message': 'Assignment created.', 'assignment': AssignmentSerializer(assignment).data},
                status=status.HTTP_201_CREATED
            )
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class AssignmentDetailView(APIView):
    """
    GET    /api/assignments/{id}/
    PUT    /api/assignments/{id}/ (admin)
    DELETE /api/assignments/{id}/ (admin)
    """
    permission_classes = [IsAuthenticated]

    def get_assignment(self, assignment_id):
        try:
            return Assignment.objects.select_related('course').get(id=assignment_id)
        except Assignment.DoesNotExist:
            return None

    def get(self, request, assignment_id):
        assignment = self.get_assignment(assignment_id)
        if not assignment:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        if not is_enrolled_or_admin(request.user, assignment.course):
            return Response({'error': 'Enrollment required.'}, status=status.HTTP_403_FORBIDDEN)

        return Response({'success': True, 'assignment': AssignmentSerializer(assignment).data})

    def put(self, request, assignment_id):
        if not (hasattr(request.user, 'role') and request.user.role.name == 'Admin'):
            return Response({'error': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)

        assignment = self.get_assignment(assignment_id)
        if not assignment:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = AssignmentSerializer(assignment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'success': True, 'assignment': serializer.data})
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, assignment_id):
        return self.put(request, assignment_id)

    def delete(self, request, assignment_id):
        if not (hasattr(request.user, 'role') and request.user.role.name == 'Admin'):
            return Response({'error': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)

        assignment = self.get_assignment(assignment_id)
        if not assignment:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        assignment.delete()
        return Response({'success': True, 'message': 'Assignment deleted.'})


class SubmitAssignmentView(APIView):
    """
    POST /api/assignments/{id}/submissions/
    Student only - Submit assignment file.
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request, assignment_id):
        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        data = {'assignment': assignment_id, 'submission_file': request.FILES.get('submission_file')}
        serializer = SubmissionCreateSerializer(data=data, context={'request': request})

        if serializer.is_valid():
            submission = serializer.save()

            # Notify admin
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                admins = User.objects.filter(role__name='Admin')
                for admin in admins:
                    send_assignment_submission_notification(admin.email, submission)
            except Exception:
                pass

            return Response(
                {
                    'success': True,
                    'message': 'Assignment submitted successfully.',
                    'submission': SubmissionDetailSerializer(submission, context={'request': request}).data,
                },
                status=status.HTTP_201_CREATED
            )
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class AssignmentSubmissionsView(APIView):
    """
    GET   /api/assignments/{id}/submissions/ - Admin: view all submissions
    PATCH /api/assignments/{id}/submissions/{sub_id}/ - Admin: update status
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, assignment_id):
        try:
            assignment = Assignment.objects.get(id=assignment_id)
        except Assignment.DoesNotExist:
            return Response({'error': 'Assignment not found.'}, status=status.HTTP_404_NOT_FOUND)

        submissions = Submission.objects.filter(assignment=assignment).select_related('student')
        serializer = SubmissionDetailSerializer(submissions, many=True, context={'request': request})
        return Response({'success': True, 'submissions': serializer.data, 'count': submissions.count()})


class MySubmissionsView(APIView):
    """
    GET /api/submissions/my/
    Student - View own submissions.
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        submissions = Submission.objects.filter(student=request.user).select_related('assignment__course')
        serializer = SubmissionDetailSerializer(submissions, many=True, context={'request': request})
        return Response({'success': True, 'submissions': serializer.data})


class SubmissionDetailView(APIView):
    """
    GET   /api/submissions/{id}/ - View single submission
    PATCH /api/submissions/{id}/ - Admin: update status (Reviewed/Rejected)
    """
    permission_classes = [IsAuthenticated]

    def get_submission(self, submission_id):
        try:
            return Submission.objects.select_related('assignment__course', 'student').get(id=submission_id)
        except Submission.DoesNotExist:
            return None

    def get(self, request, submission_id):
        submission = self.get_submission(submission_id)
        if not submission:
            return Response({'error': 'Submission not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Only the submitting student or admin can view
        is_admin = hasattr(request.user, 'role') and request.user.role.name == 'Admin'
        is_owner = submission.student == request.user

        if not (is_admin or is_owner):
            return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

        return Response({'success': True, 'submission': SubmissionDetailSerializer(submission, context={'request': request}).data})

    def patch(self, request, submission_id):
        if not (hasattr(request.user, 'role') and request.user.role.name == 'Admin'):
            return Response({'error': 'Admin only.'}, status=status.HTTP_403_FORBIDDEN)

        submission = self.get_submission(submission_id)
        if not submission:
            return Response({'error': 'Submission not found.'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in ['Submitted', 'Reviewed', 'Rejected']:
            return Response({'error': 'Invalid status. Use: Submitted, Reviewed, or Rejected.'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = submission.status
        submission.status = new_status
        submission.save()

        # Notify student if status changed
        if old_status != new_status and new_status in ['Reviewed', 'Rejected']:
            try:
                send_submission_reviewed_notification(submission.student, submission)
            except Exception:
                pass

        return Response({
            'success': True,
            'message': f'Submission status updated to {new_status}.',
            'submission': SubmissionDetailSerializer(submission, context={'request': request}).data
        })
