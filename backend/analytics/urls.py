"""
Mini LMS - Analytics URL Configuration
"""

from django.urls import path
from .views import AdminDashboardView, StudentDashboardView

urlpatterns = [
    path('admin/', AdminDashboardView.as_view(), name='admin-analytics'),
    path('student/', StudentDashboardView.as_view(), name='student-analytics'),
]
