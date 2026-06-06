"""
Unit tests for the enrollments app.

Covers
------
- Enrollment create (student)
- Duplicate enrollment prevention
- Admin cannot enroll
- My enrollments list
- Progress update
"""

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from authentication.models import Role
from courses.models import Course
from enrollments.models import Enrollment, Progress

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────────────────────

def create_role(name: str) -> Role:
    role, _ = Role.objects.get_or_create(name=name)
    return role


def create_admin(email='admin@enroll.test') -> User:
    role = create_role(Role.ADMIN)
    return User.objects.create_superuser(
        email=email,
        full_name='Admin',
        password='Admin@1234',
        role=role,
    )


def create_student(email='student@enroll.test') -> User:
    role = create_role(Role.STUDENT)
    return User.objects.create_user(
        email=email,
        full_name='Student',
        password='Student@1234',
        role=role,
    )


def create_course(admin: User, title='Enroll Course') -> Course:
    return Course.objects.create(
        title=title,
        description='A course for enrollment tests.',
        category='Test',
        created_by=admin,
    )


def auth_header(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {'HTTP_AUTHORIZATION': f'Bearer {refresh.access_token}'}


ENROLL_URL = '/api/enrollments/enroll/'
MY_ENROLLMENTS_URL = '/api/enrollments/my/'


# ─────────────────────────────────────────────────────────────────────────────
#  Enrollment Create Tests
# ─────────────────────────────────────────────────────────────────────────────

class EnrollmentCreateTests(APITestCase):
    """Test POST /api/enrollments/enroll/"""

    def setUp(self):
        self.admin = create_admin()
        self.student = create_student()
        self.course = create_course(self.admin)

    def test_student_can_enroll(self):
        """A student should be able to enroll in a course and get 201."""
        response = self.client.post(
            ENROLL_URL,
            {'course_id': self.course.pk},
            format='json',
            **auth_header(self.student),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Enrollment.objects.filter(student=self.student, course=self.course).exists()
        )

    def test_enrollment_creates_progress_record(self):
        """Enrolling should automatically create a 0% progress record."""
        self.client.post(
            ENROLL_URL,
            {'course_id': self.course.pk},
            format='json',
            **auth_header(self.student),
        )
        self.assertTrue(
            Progress.objects.filter(student=self.student, course=self.course).exists()
        )

    def test_duplicate_enrollment_rejected(self):
        """Enrolling twice in the same course should return 409."""
        Enrollment.objects.create(student=self.student, course=self.course)
        response = self.client.post(
            ENROLL_URL,
            {'course_id': self.course.pk},
            format='json',
            **auth_header(self.student),
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_admin_cannot_enroll(self):
        """Admins should be blocked from enrolling and receive 403."""
        response = self.client.post(
            ENROLL_URL,
            {'course_id': self.course.pk},
            format='json',
            **auth_header(self.admin),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_enroll_nonexistent_course(self):
        """Enrolling in a non-existent course should return 400 or 404."""
        response = self.client.post(
            ENROLL_URL,
            {'course_id': 99999},
            format='json',
            **auth_header(self.student),
        )
        self.assertIn(response.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND])

    def test_unauthenticated_cannot_enroll(self):
        """Unauthenticated POST should return 401."""
        response = self.client.post(
            ENROLL_URL,
            {'course_id': self.course.pk},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ─────────────────────────────────────────────────────────────────────────────
#  My Enrollments Tests
# ─────────────────────────────────────────────────────────────────────────────

class MyEnrollmentsTests(APITestCase):
    """Test GET /api/enrollments/my/"""

    def setUp(self):
        self.admin = create_admin()
        self.student = create_student()
        self.course1 = create_course(self.admin, 'Course 1')
        self.course2 = create_course(self.admin, 'Course 2')
        Enrollment.objects.create(student=self.student, course=self.course1)
        Enrollment.objects.create(student=self.student, course=self.course2)

    def test_student_sees_own_enrollments(self):
        """Student should see exactly their own enrollments."""
        response = self.client.get(MY_ENROLLMENTS_URL, **auth_header(self.student))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)

    def test_admin_blocked_from_my_enrollments(self):
        """Admins should receive 403 from the student-only endpoint."""
        response = self.client.get(MY_ENROLLMENTS_URL, **auth_header(self.admin))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_blocked(self):
        """Unauthenticated GET should return 401."""
        response = self.client.get(MY_ENROLLMENTS_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


# ─────────────────────────────────────────────────────────────────────────────
#  Progress Update Tests
# ─────────────────────────────────────────────────────────────────────────────

class ProgressUpdateTests(APITestCase):
    """Test PUT /api/progress/{course_id}/"""

    def setUp(self):
        self.admin = create_admin()
        self.student = create_student()
        self.course = create_course(self.admin)
        Enrollment.objects.create(student=self.student, course=self.course)

    def _url(self):
        return f'/api/progress/{self.course.pk}/'

    def test_student_can_update_progress(self):
        """Student can update their progress percentage."""
        response = self.client.put(
            self._url(),
            {'percentage': '75.00'},
            format='json',
            **auth_header(self.student),
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        progress = Progress.objects.get(student=self.student, course=self.course)
        self.assertEqual(float(progress.percentage), 75.00)

    def test_progress_above_100_rejected(self):
        """Percentage > 100 should return 400."""
        response = self.client.put(
            self._url(),
            {'percentage': '110.00'},
            format='json',
            **auth_header(self.student),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_enrolled_student_blocked(self):
        """A student not enrolled in the course should receive 404."""
        other_student = create_student(email='other@enroll.test')
        response = self.client.put(
            self._url(),
            {'percentage': '50.00'},
            format='json',
            **auth_header(other_student),
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
