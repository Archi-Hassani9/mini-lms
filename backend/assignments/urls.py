"""
Mini LMS - Assignments URL Configuration
"""

from django.urls import path
from .views import (
    CourseAssignmentsView,
    AssignmentDetailView,
    SubmitAssignmentView,
    AssignmentSubmissionsView,
    MySubmissionsView,
    SubmissionDetailView,
)

urlpatterns = [
    path('courses/<int:course_id>/assignments/', CourseAssignmentsView.as_view(), name='course-assignments'),
    path('assignments/<int:assignment_id>/', AssignmentDetailView.as_view(), name='assignment-detail'),
    path('assignments/<int:assignment_id>/submissions/', SubmitAssignmentView.as_view(), name='submit-assignment'),
    path('assignments/<int:assignment_id>/all-submissions/', AssignmentSubmissionsView.as_view(), name='assignment-submissions'),
    path('submissions/my/', MySubmissionsView.as_view(), name='my-submissions'),
    path('submissions/<int:submission_id>/', SubmissionDetailView.as_view(), name='submission-detail'),
]
