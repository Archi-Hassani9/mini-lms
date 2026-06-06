"""
Mini LMS - Enrollment and Progress Models
Matching MySQL schema: enrollments, progress tables.
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Enrollment(models.Model):
    """
    Enrollment model - tracks which students are enrolled in which courses.
    UNIQUE constraint on (student, course) prevents duplicate enrollments.
    """
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name='enrollments',
        db_column='student_id'
    )
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.RESTRICT,
        related_name='enrollments',
        db_column='course_id'
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'enrollments'
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'
        # CRITICAL: Prevent duplicate enrollments (student + course must be unique)
        unique_together = [('student', 'course')]
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['course']),
        ]

    def __str__(self):
        return f"{self.student.full_name} enrolled in {self.course.title}"


class Progress(models.Model):
    """
    Progress model - tracks student progress in each enrolled course.
    UNIQUE constraint on (student, course) ensures one record per student-course pair.
    """
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name='progress_records',
        db_column='student_id'
    )
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.RESTRICT,
        related_name='progress_records',
        db_column='course_id'
    )
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        validators=[
            MinValueValidator(0.00),
            MaxValueValidator(100.00)
        ]
    )
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'progress'
        verbose_name = 'Progress'
        verbose_name_plural = 'Progress Records'
        # One progress record per student-course pair
        unique_together = [('student', 'course')]
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['course']),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.course.title}: {self.percentage}%"
