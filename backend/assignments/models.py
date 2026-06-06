"""
Mini LMS - Assignment and Submission Models
Matching MySQL schema: assignments, submissions tables.
"""

import uuid
import os
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.utils import timezone


def submission_upload_path(instance, filename):
    """
    Generate a unique upload path for submission files.
    Format: submissions/{uuid4}_{original_filename}
    Prevents filename collisions and path traversal attacks.
    """
    ext = os.path.splitext(filename)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    return f"submissions/{unique_filename}"


class Assignment(models.Model):
    """
    Assignment model matching the MySQL assignments table.
    Each assignment belongs to a course and has a deadline.
    """
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.RESTRICT,
        related_name='assignments',
        db_column='course_id'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    deadline = models.DateTimeField()
    max_marks = models.PositiveIntegerField(
        default=100,
        validators=[MinValueValidator(1)],
        help_text="Maximum marks for this assignment (must be >= 1)"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assignments'
        verbose_name = 'Assignment'
        verbose_name_plural = 'Assignments'
        ordering = ['deadline']
        indexes = [
            models.Index(fields=['course']),
            models.Index(fields=['deadline']),
        ]

    def __str__(self):
        return f"{self.course.title} - {self.title}"

    @property
    def is_past_deadline(self):
        """Check if the assignment deadline has passed."""
        return timezone.now() > self.deadline


class Submission(models.Model):
    """
    Submission model matching the MySQL submissions table.
    UNIQUE constraint on (assignment, student) prevents duplicate submissions.
    """

    STATUS_SUBMITTED = 'Submitted'
    STATUS_REVIEWED = 'Reviewed'
    STATUS_REJECTED = 'Rejected'

    STATUS_CHOICES = [
        (STATUS_SUBMITTED, 'Submitted'),
        (STATUS_REVIEWED, 'Reviewed'),
        (STATUS_REJECTED, 'Rejected'),
    ]

    assignment = models.ForeignKey(
        Assignment,
        on_delete=models.RESTRICT,
        related_name='submissions',
        db_column='assignment_id'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name='submissions',
        db_column='student_id'
    )
    submission_file = models.FileField(
        upload_to=submission_upload_path,
        max_length=500
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_SUBMITTED
    )

    class Meta:
        db_table = 'submissions'
        verbose_name = 'Submission'
        verbose_name_plural = 'Submissions'
        # CRITICAL: Prevent duplicate submissions (assignment + student must be unique)
        unique_together = [('assignment', 'student')]
        indexes = [
            models.Index(fields=['assignment']),
            models.Index(fields=['student']),
        ]

    def __str__(self):
        return f"{self.student.full_name} - {self.assignment.title} ({self.status})"

    @property
    def file_url(self):
        """Return the file URL (local or Cloudinary)."""
        if self.submission_file:
            return self.submission_file.url
        return None
