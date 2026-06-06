"""
Mini LMS - Authentication Models
Custom User model with Role-based access control.
Tables: roles, users (matching MySQL schema in database/schema.sql)
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator


class Role(models.Model):
    """
    Role model - defines user roles in the system.
    Default roles: Admin, Student
    """
    ADMIN = 'Admin'
    STUDENT = 'Student'

    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (STUDENT, 'Student'),
    ]

    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'roles'
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'

    def __str__(self):
        return self.name


class UserManager(BaseUserManager):
    """Custom manager for the User model using email as the unique identifier."""

    def create_user(self, email, full_name, password=None, **extra_fields):
        """Create and return a regular user."""
        if not email:
            raise ValueError('The Email field must be set')
        if not full_name:
            raise ValueError('The Full Name field must be set')

        email = self.normalize_email(email)

        # Assign Student role by default
        if 'role' not in extra_fields:
            student_role, _ = Role.objects.get_or_create(name=Role.STUDENT)
            extra_fields['role'] = student_role

        user = self.model(email=email, full_name=full_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        """Create and return a superuser with Admin role."""
        admin_role, _ = Role.objects.get_or_create(name=Role.ADMIN)
        extra_fields.setdefault('role', admin_role)
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, full_name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model matching the MySQL schema.
    Uses email as the unique identifier instead of username.
    """

    role = models.ForeignKey(
        Role,
        on_delete=models.RESTRICT,
        related_name='users',
        db_column='role_id'
    )
    full_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=255, unique=True, db_index=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    @property
    def is_admin(self):
        """Check if user has Admin role."""
        return self.role.name == Role.ADMIN

    @property
    def is_student(self):
        """Check if user has Student role."""
        return self.role.name == Role.STUDENT

    def get_full_name(self):
        return self.full_name

    def get_short_name(self):
        return self.full_name.split()[0] if self.full_name else self.email
