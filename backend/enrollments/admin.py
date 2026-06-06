"""Django admin registration for the enrollments app."""

from django.contrib import admin

from .models import Enrollment, Progress


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'course', 'enrolled_at']
    list_filter = ['course', 'enrolled_at']
    search_fields = ['student__email', 'student__full_name', 'course__title']
    ordering = ['-enrolled_at']
    raw_id_fields = ['student', 'course']
    readonly_fields = ['enrolled_at']


@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'course', 'percentage', 'last_updated']
    list_filter = ['course']
    search_fields = ['student__email', 'course__title']
    ordering = ['-last_updated']
    raw_id_fields = ['student', 'course']
