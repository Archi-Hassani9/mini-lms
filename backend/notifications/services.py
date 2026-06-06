"""
Mini LMS - Notifications Service
Email notification system - console in dev, SendGrid-ready for production.
Structured so that changing EMAIL_BACKEND in settings is all that's needed for prod.
"""

import logging
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def send_welcome_email(user):
    """
    Send a welcome email to newly registered users.
    Called after successful registration.
    """
    subject = "Welcome to Mini LMS! 🎓"
    message = f"""
Hi {user.full_name},

Welcome to Mini LMS! We're excited to have you on board.

Your account has been created successfully:
• Email: {user.email}
• Role: {user.role.name}

You can now:
• Browse and enroll in courses
• Access lesson materials
• Submit assignments
• Track your progress

Get started by visiting our courses page.

Best regards,
The Mini LMS Team
    """.strip()

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"Welcome email sent to {user.email}")
    except Exception as e:
        logger.error(f"Failed to send welcome email to {user.email}: {str(e)}")


def send_enrollment_confirmation(user, course):
    """
    Send enrollment confirmation email to student.
    Called after successful course enrollment.
    """
    subject = f"Enrollment Confirmed: {course.title}"
    message = f"""
Hi {user.full_name},

Great news! You have been successfully enrolled in:

📚 Course: {course.title}
📁 Category: {course.category or 'General'}

You can now:
• Access all course lessons
• Submit assignments
• Track your progress

Start learning today!

Best regards,
The Mini LMS Team
    """.strip()

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"Enrollment confirmation sent to {user.email} for course '{course.title}'")
    except Exception as e:
        logger.error(f"Failed to send enrollment email: {str(e)}")


def send_assignment_submission_notification(admin_email, submission):
    """
    Notify admin when a student submits an assignment.
    """
    subject = f"New Submission: {submission.assignment.title}"
    message = f"""
A new assignment submission has been received.

Student: {submission.student.full_name} ({submission.student.email})
Assignment: {submission.assignment.title}
Course: {submission.assignment.course.title}
Submitted At: {submission.submitted_at.strftime('%Y-%m-%d %H:%M UTC')}
Status: {submission.status}

Please review the submission in the admin dashboard.

Mini LMS Admin System
    """.strip()

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[admin_email],
            fail_silently=False,
        )
        logger.info(f"Submission notification sent to admin {admin_email}")
    except Exception as e:
        logger.error(f"Failed to send submission notification: {str(e)}")


def send_submission_reviewed_notification(student, submission):
    """
    Notify student when their submission has been reviewed.
    """
    status_emoji = "✅" if submission.status == "Reviewed" else "❌"

    subject = f"{status_emoji} Submission {submission.status}: {submission.assignment.title}"
    message = f"""
Hi {student.full_name},

Your assignment submission has been reviewed.

Assignment: {submission.assignment.title}
Course: {submission.assignment.course.title}
Status: {submission.status}

{"Congratulations! Your submission has been accepted." if submission.status == "Reviewed" else "Unfortunately, your submission was rejected. Please check with your instructor for details."}

Best regards,
The Mini LMS Team
    """.strip()

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[student.email],
            fail_silently=False,
        )
        logger.info(f"Review notification sent to {student.email}")
    except Exception as e:
        logger.error(f"Failed to send review notification: {str(e)}")
