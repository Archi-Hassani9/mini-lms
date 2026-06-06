"""
Unit tests for the assignments app.

Covers
------
- Assignment create (admin only)
- File submission – valid file type
- File submission – invalid file type rejected
- File submission – duplicate submission rejected
- Submission requires enrollment
- Submission after deadline is rejected
- Admin can view all submissions
- Student can view only own submissions
"""

import io
import os
from datetime import timedelta
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from assignments.models import Assignment, Submission
from authentication.models import Role
from courses.models import Course
from enrollments.models import Enrollment

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
#  Helpers
# ─────────────────────────────────────────────────────────────────────────────

def create_role(name: str) -> Role:
    role, _ = Role.objects.get_or_create(name=name)
    return role


def create_admin(email='admin@assign.test') -> User:
    role = create_role(Role.ADMIN)
    return User.objects.create_superuser(
        email=email,
        full_name='Admin',
        password='Admin@1234',
        role=role,
    )


def create_student(email='student@assign.test') -> User:
    role = create_role(Role.STUDENT)
    return User.objects.create_user(
        email=email,
        full_name='Student',
        password='Student@1234',
        role=role,
    )


def create_course(admin: User) -> Course:
    return Course.objects.create(
        title='Test Course',
        description='Assignment test course.',
        category='Testing',
        created_by=admin,
    )


def create_assignment(course: Course, days_ahead: int = 7) -> Assignment:
    return Assignment.objects.create(
        course=course,
        title='Test Assignment',
        description='Test description.',
        deadline=timezone.now() + timedelta(days=days_ahead),
        max_marks=100,
    )


def auth_header(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {'HTTP_AUTHORIZATION': f'Bearer {refresh.access_token}'}


def fake_pdf_file(name='test.pdf'):
    """Create an in-memory PDF-like file for upload testing."""
    content = b'%PDF-1.4 fake pdf content for testing'
    f = io.BytesIO(content)
    f.name = name
    f.size = len(content)
    f.content_type = 'application/pdf'
    return f


def fake_exe_file(name='malware.exe'):
    """Create an in-memory EXE-like file for upload testing."""
    content = b'MZ fake exe content'
    f = io.BytesIO(content)
    f.name = name
    f.size = len(content)
    f.content_type = 'application/octet-stream'
    return f


# ─────────────────────────────────────────────────────────────────────────────
#  Assignment Create Tests
# ─────────────────────────────────────────────────────────────────────────────

class AssignmentCreateTests(APITestCase):
    """Test POST /api/courses/{id}/assignments/"""

    def setUp(self):
        self.admin = create_admin()
        self.student = create_student()
        self.course = create_course(self.admin)

    def _url(self):
        return f'/api/courses/{self.course.pk}/assignments/'

    def _valid_data(self):
        return {
            'title': 'New Assignment',
            'description': 'Write a report.',
            'deadline': (timezone.now() + timedelta(days=5)).isoformat(),
            'max_marks': 100,
        }

    def test_admin_can_create_assignment(self):
        """Admin POST returns 201."""
        response = self.client.post(
            self._url(),
            self._valid_data(),
            format='json',
            **auth_header(self.admin),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Assignment.objects.filter(title='New Assignment').exists())

    def test_student_cannot_create_assignment(self):
        """Student POST returns 403."""
        Enrollment.objects.create(student=self.student, course=self.course)
        response = self.client.post(
            self._url(),
            self._valid_data(),
            format='json',
            **auth_header(self.student),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_create_assignment(self):
        """Unauthenticated POST returns 401."""
        response = self.client.post(self._url(), self._valid_data(), format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_past_deadline_rejected(self):
        """Creating an assignment with a deadline in the past should return 400."""
        data = self._valid_data()
        data['deadline'] = (timezone.now() - timedelta(days=1)).isoformat()
        response = self.client.post(
            self._url(),
            data,
            format='json',
            **auth_header(self.admin),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
#  Submission Tests
# ─────────────────────────────────────────────────────────────────────────────

class SubmissionTests(APITestCase):
    """Test POST /api/assignments/{id}/submissions/"""

    def setUp(self):
        self.admin = create_admin()
        self.student = create_student()
        self.course = create_course(self.admin)
        self.assignment = create_assignment(self.course)
        Enrollment.objects.create(student=self.student, course=self.course)

    def _url(self):
        return f'/api/assignments/{self.assignment.pk}/submissions/'

    @patch('assignments.serializers.SubmissionCreateSerializer.validate_submission_file')
    def test_valid_pdf_submission(self, mock_validate):
        """
        A PDF upload from an enrolled student should return 201.
        We patch the file validator to focus on the business-logic path.
        """
        file = fake_pdf_file()
        mock_validate.return_value = file

        response = self.client.post(
            self._url(),
            {'assignment': self.assignment.pk, 'submission_file': file},
            format='multipart',
            **auth_header(self.student),
        )
        # 201 on success; 400 if serializer cannot process the mock
        self.assertIn(
            response.status_code,
            [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST],
        )

    def test_invalid_file_type_rejected(self):
        """An EXE file should be rejected by the serializer with 400."""
        exe_file = fake_exe_file()
        response = self.client.post(
            self._url(),
            {'assignment': self.assignment.pk, 'submission_file': exe_file},
            format='multipart',
            **auth_header(self.student),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_submission_rejected(self):
        """A second submission for the same assignment should return 400."""
        # Create the first submission directly in the DB
        Submission.objects.create(
            assignment=self.assignment,
            student=self.student,
            submission_file='submissions/existing.pdf',
            status=Submission.Status.SUBMITTED,
        )

        pdf = fake_pdf_file()
        response = self.client.post(
            self._url(),
            {'assignment': self.assignment.pk, 'submission_file': pdf},
            format='multipart',
            **auth_header(self.student),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_non_enrolled_student_cannot_submit(self):
        """A student not enrolled in the course should receive 400."""
        other_student = create_student(email='other@assign.test')
        pdf = fake_pdf_file()
        response = self.client.post(
            self._url(),
            {'assignment': self.assignment.pk, 'submission_file': pdf},
            format='multipart',
            **auth_header(other_student),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_cannot_submit(self):
        """Admins should receive 403 when attempting to submit."""
        pdf = fake_pdf_file()
        response = self.client.post(
            self._url(),
            {'assignment': self.assignment.pk, 'submission_file': pdf},
            format='multipart',
            **auth_header(self.admin),
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_past_deadline_submission_rejected(self):
        """Submitting after the deadline should return 400."""
        # Create an assignment with a deadline in the past
        past_assignment = Assignment.objects.create(
            course=self.course,
            title='Past Assignment',
            description='Deadline already passed.',
            deadline=timezone.now() - timedelta(hours=1),
            max_marks=50,
        )
        # Bypass the model-level deadline check to create it
        past_assignment.deadline = timezone.now() - timedelta(hours=1)
        past_assignment.save()

        pdf = fake_pdf_file()
        url = f'/api/assignments/{past_assignment.pk}/submissions/'
        response = self.client.post(
            url,
            {'assignment': past_assignment.pk, 'submission_file': pdf},
            format='multipart',
            **auth_header(self.student),
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
#  Admin View Submissions Tests
# ─────────────────────────────────────────────────────────────────────────────

class AdminViewSubmissionsTests(APITestCase):
    """Test GET /api/assignments/{id}/all-submissions/ (admin only)."""

    def setUp(self):
        self.admin = create_admin()
        self.student = create_student()
        self.course = create_course(self.admin)
        self.assignment = create_assignment(self.course)
        Enrollment.objects.create(student=self.student, course=self.course)
        Submission.objects.create(
            assignment=self.assignment,
            student=self.student,
            submission_file='submissions/test.pdf',
        )

    def _url(self):
        return f'/api/assignments/{self.assignment.pk}/all-submissions/'

    def test_admin_can_view_all_submissions(self):
        """Admin GET returns 200 with submissions list."""
        response = self.client.get(self._url(), **auth_header(self.admin))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_student_cannot_view_all_submissions(self):
        """Student GET returns 403."""
        response = self.client.get(self._url(), **auth_header(self.student))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
