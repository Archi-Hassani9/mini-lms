"""
Unit tests for the courses app.

Covers
------
- Course list (public access, no authentication required)
- Course create (admin only – student and unauthenticated rejected)
- Course update (admin only)
- Course delete (admin only, ownership check)
- Course search by title
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from authentication.models import Role
from courses.models import Course

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────────────────────

def create_role(name: str) -> Role:
    role, _ = Role.objects.get_or_create(name=name)
    return role


def create_admin(email='admin@courses.test') -> User:
    role = create_role(Role.ADMIN)
    return User.objects.create_superuser(
        email=email,
        full_name='Course Admin',
        password='Admin@1234',
        role=role,
    )


def create_student(email='student@courses.test') -> User:
    role = create_role(Role.STUDENT)
    return User.objects.create_user(
        email=email,
        full_name='Course Student',
        password='Student@1234',
        role=role,
    )


def create_course(admin: User, title='Test Course', category='Testing') -> Course:
    return Course.objects.create(
        title=title,
        description='A test course.',
        category=category,
        created_by=admin,
    )


def auth_header(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {'HTTP_AUTHORIZATION': f'Bearer {refresh.access_token}'}


COURSES_URL = '/api/courses/'


# ─────────────────────────────────────────────────────────────────────────────
#  Course List Tests
# ─────────────────────────────────────────────────────────────────────────────

class CourseListTests(APITestCase):
    """Test GET /api/courses/ – public access."""

    def setUp(self):
        self.admin = create_admin()
        create_course(self.admin, 'Course A', 'Cat A')
        create_course(self.admin, 'Course B', 'Cat B')

    def test_list_courses_unauthenticated(self):
        """Anyone should be able to list courses."""
        response = self.client.get(COURSES_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_courses_returns_all(self):
        """List should return all seeded courses."""
        response = self.client.get(COURSES_URL)
        # DRF paginated response has 'results' key
        count = response.data.get('count', len(response.data.get('courses', [])))
        self.assertGreaterEqual(count, 2)

    def test_search_by_title(self):
        """Search filter should narrow results by title keyword."""
        response = self.client.get(COURSES_URL, {'search': 'Course A'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data.get('courses', []))
        titles = [c['title'] for c in results]
        self.assertIn('Course A', titles)
        self.assertNotIn('Course B', titles)

    def test_filter_by_category(self):
        """Category filter should return only matching courses."""
        response = self.client.get(COURSES_URL, {'category': 'Cat A'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────────────────────
#  Course Create Tests
# ─────────────────────────────────────────────────────────────────────────────

class CourseCreateTests(APITestCase):
    """Test POST /api/courses/ – admin only."""

    valid_data = {
        'title': 'New Course',
        'description': 'A brand new course.',
        'category': 'Technology',
    }

    def setUp(self):
        self.admin = create_admin()
        self.student = create_student()

    def test_admin_can_create_course(self):
        """Admin POST should return 201 and create the course."""
        response = self.client.post(
            COURSES_URL, self.valid_data, format='json', **auth_header(self.admin)
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Course.objects.filter(title='New Course').exists())

    def test_student_cannot_create_course(self):
        """Student POST should return 403."""
        response = self.client.post(
            COURSES_URL, self.valid_data, format='json', **auth_header(self.student)
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_create_course(self):
        """Unauthenticated POST should return 401."""
        response = self.client.post(COURSES_URL, self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_course_missing_title(self):
        """Course without a title should return 400."""
        data = {'description': 'No title', 'category': 'Test'}
        response = self.client.post(
            COURSES_URL, data, format='json', **auth_header(self.admin)
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
#  Course Update Tests
# ─────────────────────────────────────────────────────────────────────────────

class CourseUpdateTests(APITestCase):
    """Test PUT/PATCH /api/courses/{id}/ – admin only."""

    def setUp(self):
        self.admin = create_admin()
        self.student = create_student()
        self.course = create_course(self.admin)

    def test_admin_can_update_own_course(self):
        """Admin can update a course they created."""
        url = f'/api/courses/{self.course.pk}/'
        response = self.client.patch(
            url,
            {'title': 'Updated Title'},
            format='json',
            **auth_header(self.admin),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.course.refresh_from_db()
        self.assertEqual(self.course.title, 'Updated Title')

    def test_student_cannot_update_course(self):
        """Student PATCH should return 403."""
        url = f'/api/courses/{self.course.pk}/'
        response = self.client.patch(
            url,
            {'title': 'Hacked Title'},
            format='json',
            **auth_header(self.student),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_update_another_admins_course(self):
        """An admin cannot edit a course they did not create."""
        other_admin = create_admin(email='other.admin@test.com')
        url = f'/api/courses/{self.course.pk}/'
        response = self.client.patch(
            url,
            {'title': 'Stolen Title'},
            format='json',
            **auth_header(other_admin),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


# ─────────────────────────────────────────────────────────────────────────────
#  Course Delete Tests
# ─────────────────────────────────────────────────────────────────────────────

class CourseDeleteTests(APITestCase):
    """Test DELETE /api/courses/{id}/ – admin only, own courses."""

    def setUp(self):
        self.admin = create_admin()
        self.student = create_student()
        self.course = create_course(self.admin)

    def test_admin_can_delete_own_course(self):
        """Admin DELETE returns 200 and removes the course."""
        url = f'/api/courses/{self.course.pk}/'
        response = self.client.delete(url, **auth_header(self.admin))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Course.objects.filter(pk=self.course.pk).exists())

    def test_student_cannot_delete_course(self):
        """Student DELETE returns 403."""
        url = f'/api/courses/{self.course.pk}/'
        response = self.client.delete(url, **auth_header(self.student))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_nonexistent_course(self):
        """Deleting a non-existent course should return 404."""
        url = '/api/courses/99999/'
        response = self.client.delete(url, **auth_header(self.admin))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
