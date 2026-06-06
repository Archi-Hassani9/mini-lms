"""
Mini LMS - Lesson Model
Matching MySQL schema: lessons table.
"""

from django.db import models
from django.core.validators import MinValueValidator


class Lesson(models.Model):
    """
    Lesson model matching the MySQL lessons table.
    Each lesson belongs to a course and has an ordering.
    """
    course = models.ForeignKey(
        'courses.Course',
        on_delete=models.RESTRICT,
        related_name='lessons',
        db_column='course_id'
    )
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True, null=True)
    video_url = models.CharField(max_length=500, blank=True, null=True)
    order_no = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Order of this lesson in the course (must be >= 1)"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lessons'
        verbose_name = 'Lesson'
        verbose_name_plural = 'Lessons'
        ordering = ['course', 'order_no']
        indexes = [
            models.Index(fields=['course']),
        ]
        # Prevent duplicate order numbers within the same course
        unique_together = [('course', 'order_no')]

    def __str__(self):
        return f"{self.course.title} - Lesson {self.order_no}: {self.title}"
