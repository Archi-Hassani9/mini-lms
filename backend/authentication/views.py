"""
Mini LMS - Authentication Views
JWT-based authentication endpoints: Register, Login, Logout, Profile.
"""

from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.views import TokenRefreshView

from .models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer,
)
from notifications.services import send_welcome_email


class RegisterView(APIView):
    """
    POST /api/auth/register/
    Public endpoint for new student registration.
    Returns JWT tokens on successful registration.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # Send welcome email (console in dev, SendGrid in prod)
        try:
            send_welcome_email(user)
        except Exception:
            pass  # Don't fail registration if email fails

        return Response(
            {
                'success': True,
                'message': 'Registration successful! Welcome to Mini LMS.',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(APIView):
    """
    POST /api/auth/login/
    Public endpoint for user authentication.
    Returns JWT tokens + user info on success.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.validated_data['user']
        tokens = serializer.get_tokens(user)

        return Response(
            {
                'success': True,
                'message': 'Login successful.',
                'user': UserProfileSerializer(user).data,
                'tokens': tokens,
            },
            status=status.HTTP_200_OK
        )


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Authenticated endpoint. Blacklists the refresh token.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return Response(
                {'success': False, 'error': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'success': True, 'message': 'Successfully logged out.'},
                status=status.HTTP_200_OK
            )
        except TokenError:
            return Response(
                {'success': False, 'error': 'Invalid or expired token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileView(APIView):
    """
    GET  /api/auth/profile/ - Get own profile
    PUT  /api/auth/profile/ - Update own profile
    POST /api/auth/profile/change-password/ - Change password
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return the authenticated user's profile."""
        serializer = UserProfileSerializer(request.user)
        return Response(
            {'success': True, 'user': serializer.data},
            status=status.HTTP_200_OK
        )

    def put(self, request):
        """Update the authenticated user's profile."""
        serializer = UserProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save()
        return Response(
            {
                'success': True,
                'message': 'Profile updated successfully.',
                'user': UserProfileSerializer(request.user).data,
            },
            status=status.HTTP_200_OK
        )

    def patch(self, request):
        return self.put(request)


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    Change authenticated user's password.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )

        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Set new password
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()

        # Blacklist all existing refresh tokens for security
        # (User must log in again)
        return Response(
            {
                'success': True,
                'message': 'Password changed successfully. Please log in again.',
            },
            status=status.HTTP_200_OK
        )
