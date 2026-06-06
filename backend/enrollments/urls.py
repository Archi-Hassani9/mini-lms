"""
Mini LMS - Enrollments URL Configuration
"""

from django.urls import path
from .views import EnrollView, MyEnrollmentsView, AllEnrollmentsView, UpdateProgressView

urlpatterns = [
    path('enrollments/', AllEnrollmentsView.as_view(), name='all-enrollments'),
    path('enrollments/enroll/', EnrollView.as_view(), name='enroll'),
    path('enrollments/my/', MyEnrollmentsView.as_view(), name='my-enrollments'),
    path('progress/<int:course_id>/', UpdateProgressView.as_view(), name='update-progress'),
]
