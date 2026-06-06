"""
Mini LMS - Course Views
CRUD operations with role-based access control.
"""

from rest_framework import viewsets, status, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Course
from .serializers import CourseListSerializer, CourseDetailSerializer, CourseCreateUpdateSerializer
from authentication.permissions import IsAdmin


class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Course CRUD operations.
    - GET list: Public (no auth required)
    - GET detail: Public
    - POST: Admin only
    - PUT/PATCH: Admin only (own courses)
    - DELETE: Admin only (own courses)
    """
    queryset = Course.objects.all().select_related('created_by', 'created_by__role')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category']
    search_fields = ['title', 'description', 'category']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']

    def get_permissions(self):
        """Apply different permissions based on the action."""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated(), IsAdmin()]

    def get_serializer_class(self):
        """Use different serializers based on the action."""
        if self.action == 'retrieve':
            return CourseDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CourseCreateUpdateSerializer
        return CourseListSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            course = serializer.save()
            return Response(
                {
                    'success': True,
                    'message': 'Course created successfully.',
                    'course': CourseListSerializer(course).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            {'success': False, 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        if serializer.is_valid():
            course = serializer.save()
            return Response(
                {
                    'success': True,
                    'message': 'Course updated successfully.',
                    'course': CourseListSerializer(course).data
                }
            )
        return Response(
            {'success': False, 'errors': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    def destroy(self, request, *args, **kwargs):
        course = self.get_object()
        course_title = course.title
        course.delete()
        return Response(
            {'success': True, 'message': f'Course "{course_title}" deleted successfully.'},
            status=status.HTTP_200_OK
        )
