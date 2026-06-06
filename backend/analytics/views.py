"""
Mini LMS - Analytics Views
Dashboard statistics for Admin and Student roles.
"""

from django.db.models import Count, Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from authentication.permissions import IsAdmin, IsStudent
from authentication.models import User, Role


class AdminDashboardView(APIView):
    """
    GET /api/analytics/admin/
    Returns comprehensive statistics for the admin dashboard.
    """
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from courses.models import Course
        from enrollments.models import Enrollment, Progress
        from assignments.models import Assignment, Submission

        # Basic counts
        student_role = Role.objects.filter(name='Student').first()
        total_students = User.objects.filter(role=student_role, is_active=True).count() if student_role else 0
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.count()
        total_submissions = Submission.objects.count()
        total_assignments = Assignment.objects.count()

        # Recent submissions (last 5)
        recent_submissions = Submission.objects.select_related(
            'student', 'assignment__course'
        ).order_by('-submitted_at')[:5]

        recent_submissions_data = [
            {
                'id': sub.id,
                'student_name': sub.student.full_name,
                'student_email': sub.student.email,
                'assignment': sub.assignment.title,
                'course': sub.assignment.course.title,
                'submitted_at': sub.submitted_at.isoformat(),
                'status': sub.status,
            }
            for sub in recent_submissions
        ]

        # Courses by category
        courses_by_category = list(
            Course.objects.values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )

        # Top 5 courses by enrollment
        enrollments_per_course = list(
            Enrollment.objects.values('course__id', 'course__title', 'course__category')
            .annotate(enrollment_count=Count('id'))
            .order_by('-enrollment_count')[:5]
        )
        
        popular_courses = [
            {
                'id': item['course__id'],
                'title': item['course__title'],
                'category': item['course__category'] or 'General',
                'enrollments': item['enrollment_count']
            }
            for item in enrollments_per_course
        ]

        # Submission status breakdown
        submission_stats = {
            'submitted': Submission.objects.filter(status='Submitted').count(),
            'reviewed': Submission.objects.filter(status='Reviewed').count(),
            'rejected': Submission.objects.filter(status='Rejected').count(),
        }

        # Recent students (last 5 registered)
        recent_students = User.objects.filter(role=student_role).order_by('-created_at')[:5] if student_role else []
        recent_students_data = [
            {
                'id': s.id,
                'name': s.full_name,
                'email': s.email,
                'joined': s.created_at.isoformat(),
            }
            for s in recent_students
        ]

        return Response({
            'success': True,
            'stats': {
                'total_students': total_students,
                'total_courses': total_courses,
                'total_enrollments': total_enrollments,
                'total_submissions': total_submissions,
                'total_assignments': total_assignments,
            },
            'recent_submissions': recent_submissions_data,
            'recent_students': recent_students_data,
            'courses_by_category': courses_by_category,
            'popular_courses': popular_courses,
            'submission_stats': submission_stats,
        })


class StudentDashboardView(APIView):
    """
    GET /api/analytics/student/
    Returns statistics personalized for the logged-in student.
    """
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        from enrollments.models import Enrollment, Progress
        from assignments.models import Assignment, Submission

        student = request.user

        # Enrolled courses
        enrollments = Enrollment.objects.filter(student=student).select_related('course')
        enrolled_courses_count = enrollments.count()

        # Progress
        progress_records = Progress.objects.filter(student=student)
        avg_progress = 0.0
        if progress_records.exists():
            total = sum(float(p.percentage) for p in progress_records)
            avg_progress = round(total / progress_records.count(), 2)

        # Assignments
        enrolled_course_ids = enrollments.values_list('course_id', flat=True)
        total_assignments = Assignment.objects.filter(course_id__in=enrolled_course_ids).count()
        submitted_assignments = Submission.objects.filter(student=student).count()
        pending_assignments = total_assignments - submitted_assignments

        # Courses with progress details
        courses_with_progress = []
        for enrollment in enrollments:
            course = enrollment.course
            try:
                progress = Progress.objects.get(student=student, course=course)
                progress_pct = float(progress.percentage)
            except Progress.DoesNotExist:
                progress_pct = 0.0

            course_assignments = Assignment.objects.filter(course=course).count()
            course_submissions = Submission.objects.filter(
                student=student,
                assignment__course=course
            ).count()

            courses_with_progress.append({
                'course_id': course.id,
                'title': course.title,
                'category': course.category,
                'thumbnail': course.thumbnail,
                'progress_percentage': progress_pct,
                'assignment_count': course_assignments,
                'submitted_count': course_submissions,
                'enrolled_at': enrollment.enrolled_at.isoformat(),
                'is_complete': progress_pct >= 100.0,
            })

        # Recent activity (last 5 submissions)
        recent_submissions = Submission.objects.filter(student=student).select_related(
            'assignment__course'
        ).order_by('-submitted_at')[:5]

        recent_activity = [
            {
                'type': 'submission',
                'assignment': sub.assignment.title,
                'course': sub.assignment.course.title,
                'status': sub.status,
                'date': sub.submitted_at.isoformat(),
            }
            for sub in recent_submissions
        ]

        return Response({
            'success': True,
            'stats': {
                'enrolled_courses_count': enrolled_courses_count,
                'completed_assignments': submitted_assignments,
                'pending_assignments': max(0, pending_assignments),
                'average_progress': avg_progress,
                'total_assignments': total_assignments,
            },
            'courses_with_progress': courses_with_progress,
            'recent_activity': recent_activity,
        })
