"""
Mini LMS - Authentication Serializers
Handles user registration, login, profile, and password management.
"""

import re
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Role


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for reading user profile data."""
    role = RoleSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'full_name', 'email', 'role', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'email', 'role', 'is_active', 'created_at', 'updated_at']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile data."""

    class Meta:
        model = User
        fields = ['full_name']

    def validate_full_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters.")
        return value.strip()


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Validates email uniqueness, password strength, and assigns Student role.
    """
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = ['full_name', 'email', 'password', 'confirm_password']

    def validate_email(self, value):
        """Ensure email is unique and properly formatted."""
        email = value.lower().strip()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email

    def validate_full_name(self, value):
        """Validate full name length."""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters.")
        return value.strip()

    def validate_password(self, value):
        """
        Validate password strength:
        - Min 8 characters
        - At least one uppercase letter
        - At least one digit
        - At least one special character
        """
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")

        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")

        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one digit.")

        if not re.search(r'[!@#$%^&*(),.?\":{}|<>]', value):
            raise serializers.ValidationError("Password must contain at least one special character.")

        return value

    def validate(self, attrs):
        """Validate that passwords match."""
        if attrs.get('password') != attrs.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        """Create user with Student role and hashed password."""
        validated_data.pop('confirm_password')

        # Get or create Student role
        student_role, _ = Role.objects.get_or_create(name=Role.STUDENT)

        user = User.objects.create_user(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password=validated_data['password'],
            role=student_role
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    Authenticates by email + password and returns JWT tokens.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password', '')

        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")

        # Authenticate user
        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.is_active:
            raise serializers.ValidationError("Your account has been deactivated. Please contact admin.")

        attrs['user'] = user
        return attrs

    def get_tokens(self, user):
        """Generate JWT token pair for the user."""
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password."""
    old_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    confirm_new_password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        """Apply same password strength rules as registration."""
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("New password must contain at least one uppercase letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("New password must contain at least one digit.")
        if not re.search(r'[!@#$%^&*(),.?\":{}|<>]', value):
            raise serializers.ValidationError("New password must contain at least one special character.")
        return value

    def validate(self, attrs):
        if attrs.get('new_password') != attrs.get('confirm_new_password'):
            raise serializers.ValidationError({"confirm_new_password": "New passwords do not match."})
        if attrs.get('old_password') == attrs.get('new_password'):
            raise serializers.ValidationError({"new_password": "New password must be different from current password."})
        return attrs
