"""
Unit tests for the authentication app.

Covers
------
- User registration (valid, duplicate email, weak password)
- Login (valid credentials, wrong password, inactive account)
- JWT token refresh
- Profile access (authenticated and unauthenticated)
- Password change
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from authentication.models import Role

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────────────────────

def create_role(name: str) -> Role:
    role, _ = Role.objects.get_or_create(name=name)
    return role


def create_student(email='student@test.com', password='Test@1234', full_name='Test Student') -> User:
    role = create_role(Role.STUDENT)
    return User.objects.create_user(
        email=email,
        full_name=full_name,
        password=password,
        role=role,
    )


def create_admin(email='admin@test.com', password='Admin@1234') -> User:
    role = create_role(Role.ADMIN)
    return User.objects.create_superuser(
        email=email,
        full_name='Test Admin',
        password=password,
        role=role,
    )


def auth_header(user) -> dict:
    """Return a Bearer token Authorization header for the given user."""
    refresh = RefreshToken.for_user(user)
    return {'HTTP_AUTHORIZATION': f'Bearer {refresh.access_token}'}


# ─────────────────────────────────────────────────────────────────────────────
#  Registration tests
# ─────────────────────────────────────────────────────────────────────────────

class RegistrationTests(APITestCase):
    """Test POST /api/auth/register/"""

    url = reverse('auth-register') if True else '/api/auth/register/'

    def setUp(self):
        # Ensure roles exist
        create_role(Role.STUDENT)
        create_role(Role.ADMIN)

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.url = '/api/auth/register/'

    def _register(self, data: dict):
        return self.client.post(self.url, data, format='json')

    def test_register_valid_user(self):
        """A valid registration should return 201 with JWT tokens."""
        data = {
            'full_name': 'Jane Doe',
            'email': 'jane@example.com',
            'password': 'Secure@123',
            'password_confirm': 'Secure@123',
        }
        response = self._register(data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'jane@example.com')

    def test_register_duplicate_email(self):
        """Registering with an already-used email should return 400."""
        create_student(email='dup@example.com')
        data = {
            'full_name': 'Duplicate User',
            'email': 'dup@example.com',
            'password': 'Secure@123',
            'password_confirm': 'Secure@123',
        }
        response = self._register(data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data['errors'])

    def test_register_weak_password_no_uppercase(self):
        """Password without an uppercase letter should be rejected."""
        data = {
            'full_name': 'Weak Pass',
            'email': 'weak@example.com',
            'password': 'nouppercase1!',
            'password_confirm': 'nouppercase1!',
        }
        response = self._register(data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_weak_password_too_short(self):
        """Password shorter than 8 characters should be rejected."""
        data = {
            'full_name': 'Short Pass',
            'email': 'short@example.com',
            'password': 'Sh@1',
            'password_confirm': 'Sh@1',
        }
        response = self._register(data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch(self):
        """Mismatched passwords should be rejected."""
        data = {
            'full_name': 'Mismatch User',
            'email': 'mismatch@example.com',
            'password': 'Secure@123',
            'password_confirm': 'Different@456',
        }
        response = self._register(data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_assigns_student_role(self):
        """A newly registered user should receive the Student role."""
        data = {
            'full_name': 'Role Check',
            'email': 'rolecheck@example.com',
            'password': 'Secure@123',
            'password_confirm': 'Secure@123',
        }
        self._register(data)
        user = User.objects.get(email='rolecheck@example.com')
        self.assertEqual(user.role.name, Role.STUDENT)


# ─────────────────────────────────────────────────────────────────────────────
#  Login tests
# ─────────────────────────────────────────────────────────────────────────────

class LoginTests(APITestCase):
    """Test POST /api/auth/login/"""

    URL = '/api/auth/login/'

    def setUp(self):
        create_role(Role.STUDENT)
        self.student = create_student(email='login@example.com', password='Valid@1234')

    def test_login_valid_credentials(self):
        """Valid email + password should return 200 with tokens."""
        response = self.client.post(
            self.URL,
            {'email': 'login@example.com', 'password': 'Valid@1234'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])

    def test_login_wrong_password(self):
        """Wrong password should return 400."""
        response = self.client.post(
            self.URL,
            {'email': 'login@example.com', 'password': 'WrongPass@99'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data['errors'])

    def test_login_nonexistent_email(self):
        """Login with an unknown email should return 400."""
        response = self.client.post(
            self.URL,
            {'email': 'nobody@example.com', 'password': 'Any@1234'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data['errors'])

    def test_login_inactive_user(self):
        """Login for a deactivated account should return 400."""
        self.student.is_active = False
        self.student.save()
        response = self.client.post(
            self.URL,
            {'email': 'login@example.com', 'password': 'Valid@1234'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
#  Token refresh tests
# ─────────────────────────────────────────────────────────────────────────────

class TokenRefreshTests(APITestCase):
    """Test POST /api/auth/token/refresh/"""

    URL = '/api/auth/token/refresh/'

    def setUp(self):
        create_role(Role.STUDENT)
        self.student = create_student()

    def test_token_refresh_valid(self):
        """A valid refresh token should return a new access token."""
        refresh = RefreshToken.for_user(self.student)
        response = self.client.post(
            self.URL,
            {'refresh': str(refresh)},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_token_refresh_invalid(self):
        """An invalid refresh token string should return 401."""
        response = self.client.post(
            self.URL,
            {'refresh': 'this-is-not-a-token'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ─────────────────────────────────────────────────────────────────────────────
#  Profile tests
# ─────────────────────────────────────────────────────────────────────────────

class ProfileTests(APITestCase):
    """Test GET /api/auth/profile/ and PUT /api/auth/profile/"""

    URL = '/api/auth/profile/'

    def setUp(self):
        create_role(Role.STUDENT)
        self.student = create_student()

    def test_profile_access_authenticated(self):
        """An authenticated user should be able to retrieve their profile."""
        response = self.client.get(self.URL, **auth_header(self.student))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], self.student.email)

    def test_profile_access_unauthenticated(self):
        """An unauthenticated request should be rejected with 401."""
        response = self.client.get(self.URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_update(self):
        """A PUT request with a new name should update the profile."""
        response = self.client.put(
            self.URL,
            {'full_name': 'Updated Name'},
            format='json',
            **auth_header(self.student),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student.refresh_from_db()
        self.assertEqual(self.student.full_name, 'Updated Name')
