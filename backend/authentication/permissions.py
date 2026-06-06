"""
Mini LMS - Custom Permission Classes
Role-based access control for admin and student roles.
"""

from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """
    Allow access only to users with the Admin role.
    Used for course creation, student management, submission review, etc.
    """
    message = "Access denied. This action requires Admin privileges."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'role') and
            request.user.role.name == 'Admin'
        )


class IsStudent(BasePermission):
    """
    Allow access only to users with the Student role.
    Used for enrollment, assignment submission, etc.
    """
    message = "Access denied. This action requires Student privileges."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'role') and
            request.user.role.name == 'Student'
        )


class IsAdminOrReadOnly(BasePermission):
    """
    Allow read-only access to authenticated users,
    but write access only to Admin users.
    """
    message = "Write access requires Admin privileges."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False

        # Read permissions for any authenticated user
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        # Write permissions only for Admin
        return (
            hasattr(request.user, 'role') and
            request.user.role.name == 'Admin'
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Allow object-level access to the owner or Admin users.
    Object must have a 'student' or 'created_by' field.
    """
    message = "You do not have permission to access this resource."

    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False

        # Admin has full access
        if hasattr(request.user, 'role') and request.user.role.name == 'Admin':
            return True

        # Check ownership
        if hasattr(obj, 'student'):
            return obj.student == request.user
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user

        return False
