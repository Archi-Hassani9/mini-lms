"""
Mini LMS - Course Models
Matching MySQL schema: courses table.
"""

from django.db import models
from django.conf import settings


CATEGORY_CHOICES = [
    ('Web Development', 'Web Development'),
    ('Data Science', 'Data Science'),
    ('UI/UX Design', 'UI/UX Design'),
    ('Python Programming', 'Python Programming'),
    ('Digital Marketing', 'Digital Marketing'),
    ('Mobile Development', 'Mobile Development'),
    ('Cybersecurity', 'Cybersecurity'),
    ('Cloud Computing', 'Cloud Computing'),
    ('Other', 'Other'),
]


class Course(models.Model):
    """
    Course model matching the MySQL courses table.
    """
    title = models.CharField(max_length=200, db_index=True)
    description = models.TextField()
    thumbnail = models.CharField(max_length=500, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True, db_index=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.RESTRICT,
        related_name='created_courses',
        db_column='created_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['title']),
            models.Index(fields=['category']),
            models.Index(fields=['created_by']),
        ]

    def __str__(self):
        return self.title

    @property
    def lesson_count(self):
        return self.lessons.count()

    @property
    def enrollment_count(self):
        return self.enrollments.count()
