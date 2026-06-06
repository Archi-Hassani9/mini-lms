"""Django admin registrations for the assignments app."""

from django.contrib import admin

from .models import Assignment, Submission


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'course', 'deadline', 'max_marks', 'created_at']
    list_filter = ['course', 'deadline']
    search_fields = ['title', 'course__title']
    ordering = ['deadline']
    readonly_fields = ['created_at']
    raw_id_fields = ['course']


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'assignment', 'status', 'submitted_at']
    list_filter = ['status', 'submitted_at']
    search_fields = ['student__email', 'assignment__title']
    ordering = ['-submitted_at']
    readonly_fields = ['submitted_at']
    raw_id_fields = ['student', 'assignment']
