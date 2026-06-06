"""Django admin registration for the lessons app."""

from django.contrib import admin

from .models import Lesson


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['id', 'course', 'order_no', 'title', 'created_at']
    list_filter = ['course']
    search_fields = ['title', 'course__title']
    ordering = ['course', 'order_no']
    readonly_fields = ['created_at']
    raw_id_fields = ['course']
