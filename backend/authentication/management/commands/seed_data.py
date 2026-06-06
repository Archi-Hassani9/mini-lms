"""
Mini LMS - Seed Data Management Command
Run: python manage.py seed_data

Creates realistic sample data for development and testing:
- 2 roles (Admin, Student)
- 1 admin + 5 students
- 5 courses with 3-4 lessons each
- 2 assignments per course
- Sample enrollments and progress records
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = 'Seed the database with sample data for development'

    def handle(self, *args, **options):
        from authentication.models import Role, User
        from courses.models import Course
        from lessons.models import Lesson
        from assignments.models import Assignment
        from enrollments.models import Enrollment, Progress

        self.stdout.write(self.style.MIGRATE_HEADING('\n🌱 Starting Mini LMS Database Seeding...\n'))

        # ============================================================
        # 1. Create Roles
        # ============================================================
        self.stdout.write('Creating roles...')
        admin_role, _ = Role.objects.get_or_create(name='Admin')
        student_role, _ = Role.objects.get_or_create(name='Student')
        self.stdout.write(self.style.SUCCESS('  ✓ Roles created: Admin, Student'))

        # ============================================================
        # 2. Create Admin User
        # ============================================================
        self.stdout.write('Creating admin user...')
        admin_user, created = User.objects.get_or_create(
            email='admin@lms.com',
            defaults={
                'full_name': 'LMS Administrator',
                'role': admin_role,
                'is_active': True,
                'is_staff': True,
                'is_superuser': True,
                'password': make_password('Admin@123'),
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS('  ✓ Admin created: admin@lms.com / Admin@123'))
        else:
            self.stdout.write('  → Admin already exists, skipping.')

        # ============================================================
        # 3. Create 5 Student Users
        # ============================================================
        self.stdout.write('Creating students...')
        students_data = [
            {'full_name': 'John Doe', 'email': 'john.doe@student.com', 'password': 'Student@123'},
            {'full_name': 'Sarah Johnson', 'email': 'sarah.johnson@student.com', 'password': 'Student@123'},
            {'full_name': 'Michael Chen', 'email': 'michael.chen@student.com', 'password': 'Student@123'},
            {'full_name': 'Emily Rodriguez', 'email': 'emily.rodriguez@student.com', 'password': 'Student@123'},
            {'full_name': 'David Kumar', 'email': 'david.kumar@student.com', 'password': 'Student@123'},
        ]

        students = []
        for s_data in students_data:
            user, created = User.objects.get_or_create(
                email=s_data['email'],
                defaults={
                    'full_name': s_data['full_name'],
                    'role': student_role,
                    'is_active': True,
                    'password': make_password(s_data['password']),
                }
            )
            students.append(user)
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✓ Student: {s_data['full_name']}"))

        # ============================================================
        # 4. Create 5 Courses
        # ============================================================
        self.stdout.write('Creating courses...')
        courses_data = [
            {
                'title': 'Full-Stack Web Development with React & Django',
                'description': 'Master modern web development from frontend to backend. Build production-ready applications using React.js for the frontend, Django REST Framework for the API, and MySQL for data storage. Learn industry-standard patterns, authentication, deployment, and best practices.',
                'category': 'Web Development',
                'thumbnail': 'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=500',
            },
            {
                'title': 'Data Science & Machine Learning with Python',
                'description': 'Dive into the world of data science and machine learning. Learn to analyze datasets, build predictive models, and extract insights using Python, Pandas, NumPy, Scikit-learn, and visualization libraries. Complete real-world projects.',
                'category': 'Data Science',
                'thumbnail': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500',
            },
            {
                'title': 'UI/UX Design Fundamentals & Figma Mastery',
                'description': 'Learn the principles of great user interface and user experience design. Master Figma for designing wireframes, prototypes, and polished UI components. Understand design thinking, usability, accessibility, and how to communicate designs to developers.',
                'category': 'UI/UX Design',
                'thumbnail': 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500',
            },
            {
                'title': 'Python Programming: From Beginner to Advanced',
                'description': 'A comprehensive Python course covering fundamentals to advanced topics. From variables and data structures to object-oriented programming, decorators, generators, async programming, and building real applications. Perfect for beginners and intermediate developers.',
                'category': 'Python Programming',
                'thumbnail': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500',
            },
            {
                'title': 'Digital Marketing & SEO Strategy 2026',
                'description': 'Grow your business or career with digital marketing expertise. Learn SEO, SEM, social media marketing, content strategy, email marketing, analytics with Google Analytics 4, and paid advertising on Google and Meta platforms.',
                'category': 'Digital Marketing',
                'thumbnail': 'https://images.unsplash.com/photo-1432888622747-4eb9a8f5f9ff?w=500',
            },
        ]

        courses = []
        for c_data in courses_data:
            course, created = Course.objects.get_or_create(
                title=c_data['title'],
                defaults={**c_data, 'created_by': admin_user}
            )
            courses.append(course)
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✓ Course: {c_data['title'][:50]}..."))

        # ============================================================
        # 5. Create Lessons (3-4 per course)
        # ============================================================
        self.stdout.write('Creating lessons...')
        lessons_data = {
            courses[0].id: [  # Web Development
                {'title': 'Introduction to Full-Stack Development', 'order_no': 1, 'content': 'Welcome to the course! In this lesson, we will cover what full-stack development means, the tools we will use, and set up our development environment with Node.js, Python, and MySQL.', 'video_url': 'https://youtube.com/embed/ysEN5RaKOlA'},
                {'title': 'React Fundamentals: Components & State', 'order_no': 2, 'content': 'Learn React core concepts: components, JSX, props, and state management. We will build our first interactive components and understand the React rendering lifecycle. Hands-on exercises included.', 'video_url': 'https://youtube.com/embed/SqcY0GlETPk'},
                {'title': 'Django REST Framework: Building APIs', 'order_no': 3, 'content': 'Build powerful REST APIs with Django REST Framework. Cover serializers, viewsets, authentication, permissions, and pagination. We will create the backend for our LMS application step by step.', 'video_url': 'https://youtube.com/embed/c708Nf0cHrs'},
                {'title': 'JWT Authentication & Deployment', 'order_no': 4, 'content': 'Implement JWT-based authentication for secure API access. Learn how to deploy your Django backend to Render and your React frontend to Vercel. Configure environment variables for production.', 'video_url': None},
            ],
            courses[1].id: [  # Data Science
                {'title': 'Python for Data Science: Pandas & NumPy', 'order_no': 1, 'content': 'Master the essential Python libraries for data science. Learn to load, clean, transform, and analyze data with Pandas DataFrames and NumPy arrays. Work through real-world datasets.', 'video_url': 'https://youtube.com/embed/vmEHCJofslg'},
                {'title': 'Data Visualization with Matplotlib & Seaborn', 'order_no': 2, 'content': 'Create compelling visualizations to communicate data insights. Build line charts, scatter plots, heatmaps, and more using Matplotlib and Seaborn. Learn best practices for data storytelling.', 'video_url': 'https://youtube.com/embed/UO98RBbO_5c'},
                {'title': 'Machine Learning with Scikit-learn', 'order_no': 3, 'content': 'Introduction to supervised and unsupervised machine learning. Build classification and regression models using Scikit-learn. Learn model evaluation, cross-validation, and hyperparameter tuning.', 'video_url': None},
            ],
            courses[2].id: [  # UI/UX
                {'title': 'Design Principles & Visual Hierarchy', 'order_no': 1, 'content': 'Understand the fundamental principles of visual design: hierarchy, contrast, alignment, repetition, and proximity. Learn color theory, typography, and whitespace to create visually appealing interfaces.', 'video_url': 'https://youtube.com/embed/eMQB90JU09Y'},
                {'title': 'User Research & Persona Creation', 'order_no': 2, 'content': 'Learn user-centered design methodology. Conduct user interviews, surveys, and usability tests. Create detailed user personas and journey maps to guide your design decisions.', 'video_url': None},
                {'title': 'Figma Mastery: Components & Auto Layout', 'order_no': 3, 'content': 'Master Figma for professional UI design. Learn components, variants, auto layout, and design tokens. Build a complete design system from scratch and create responsive prototypes.', 'video_url': 'https://youtube.com/embed/Cx2dkpBxst8'},
                {'title': 'Prototyping & Handoff to Developers', 'order_no': 4, 'content': 'Create interactive prototypes in Figma to simulate the user experience. Learn how to organize design files and hand off specifications to developers using Figma Inspect.', 'video_url': None},
            ],
            courses[3].id: [  # Python
                {'title': 'Python Basics: Variables, Types & Control Flow', 'order_no': 1, 'content': 'Start your Python journey! Learn about variables, data types (int, float, str, bool, list, dict, tuple), conditional statements, loops, and functions. Write your first Python programs.', 'video_url': 'https://youtube.com/embed/rfscVS0vtbw'},
                {'title': 'Object-Oriented Programming in Python', 'order_no': 2, 'content': 'Learn OOP concepts: classes, objects, inheritance, polymorphism, and encapsulation. Build a library management system to apply these concepts in a real-world project.', 'video_url': 'https://youtube.com/embed/JeznW_7DlB0'},
                {'title': 'Advanced Python: Decorators & Generators', 'order_no': 3, 'content': 'Dive into advanced Python features: decorators, generators, context managers, and iterators. Understand when and how to use these powerful tools to write cleaner, more efficient code.', 'video_url': None},
            ],
            courses[4].id: [  # Digital Marketing
                {'title': 'SEO Fundamentals & Keyword Research', 'order_no': 1, 'content': 'Learn how search engines work and how to optimize content for better rankings. Master keyword research using Google Keyword Planner and Ahrefs. Understand on-page and off-page SEO strategies.', 'video_url': 'https://youtube.com/embed/hF515-0Tduk'},
                {'title': 'Social Media Marketing Strategy', 'order_no': 2, 'content': 'Develop effective social media strategies for Instagram, LinkedIn, Twitter, and TikTok. Learn content calendar planning, audience targeting, engagement tactics, and how to measure ROI.', 'video_url': None},
                {'title': 'Google Ads & Meta Ads: Paid Advertising', 'order_no': 3, 'content': 'Set up and manage successful paid advertising campaigns on Google and Meta platforms. Learn targeting, bidding strategies, ad copywriting, A/B testing, and conversion tracking.', 'video_url': None},
            ],
        }

        for course_id, course_lessons in lessons_data.items():
            course = Course.objects.get(id=course_id)
            for lesson_data in course_lessons:
                lesson, created = Lesson.objects.get_or_create(
                    course=course,
                    order_no=lesson_data['order_no'],
                    defaults={
                        'title': lesson_data['title'],
                        'content': lesson_data['content'],
                        'video_url': lesson_data.get('video_url'),
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f"  ✓ Lesson: {lesson_data['title'][:40]}..."))

        # ============================================================
        # 6. Create Assignments (1-2 per course)
        # ============================================================
        self.stdout.write('Creating assignments...')
        assignments_data = [
            {
                'course': courses[0],
                'title': 'Build a REST API with Django REST Framework',
                'description': 'Create a complete REST API for a Blog application with CRUD operations, JWT authentication, and pagination. The API should include endpoints for posts, categories, comments, and user management.',
                'deadline': timezone.now() + timedelta(days=14),
                'max_marks': 100,
            },
            {
                'course': courses[0],
                'title': 'Deploy a Full-Stack App to Vercel + Render',
                'description': 'Deploy the Blog API (from Assignment 1) to Render and create a simple React frontend deployed on Vercel. Configure environment variables, CORS, and ensure the deployed app works end-to-end.',
                'deadline': timezone.now() + timedelta(days=21),
                'max_marks': 80,
            },
            {
                'course': courses[1],
                'title': 'Exploratory Data Analysis on Housing Dataset',
                'description': 'Perform comprehensive EDA on the California Housing Dataset. Clean the data, handle missing values, create visualizations showing correlations, distributions, and outliers. Write a report with your findings.',
                'deadline': timezone.now() + timedelta(days=10),
                'max_marks': 100,
            },
            {
                'course': courses[2],
                'title': 'Design a Mobile App UI in Figma',
                'description': 'Design a complete mobile app UI for a fitness tracking application in Figma. Include: onboarding screens, dashboard, workout tracking, and profile pages. Create a clickable prototype.',
                'deadline': timezone.now() + timedelta(days=12),
                'max_marks': 100,
            },
            {
                'course': courses[3],
                'title': 'Build a Command-Line Task Manager in Python',
                'description': 'Create a command-line task management application using Python OOP. It should support adding, listing, completing, and deleting tasks with persistence using JSON files.',
                'deadline': timezone.now() + timedelta(days=7),
                'max_marks': 80,
            },
            {
                'course': courses[4],
                'title': 'SEO Audit Report for a Real Website',
                'description': 'Choose any public website and perform a complete SEO audit. Analyze on-page SEO, page speed, mobile-friendliness, backlinks, and keyword opportunities. Submit a detailed 10-page PDF report.',
                'deadline': timezone.now() + timedelta(days=9),
                'max_marks': 100,
            },
        ]

        created_assignments = []
        for a_data in assignments_data:
            assignment, created = Assignment.objects.get_or_create(
                course=a_data['course'],
                title=a_data['title'],
                defaults={
                    'description': a_data['description'],
                    'deadline': a_data['deadline'],
                    'max_marks': a_data['max_marks'],
                }
            )
            created_assignments.append(assignment)
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✓ Assignment: {a_data['title'][:45]}..."))

        # ============================================================
        # 7. Create Enrollments
        # ============================================================
        self.stdout.write('Creating enrollments...')
        enrollments_data = [
            (students[0], courses[0]),  # John → Web Dev
            (students[0], courses[3]),  # John → Python
            (students[1], courses[0]),  # Sarah → Web Dev
            (students[1], courses[2]),  # Sarah → UI/UX
            (students[1], courses[4]),  # Sarah → Marketing
            (students[2], courses[1]),  # Michael → Data Science
            (students[2], courses[3]),  # Michael → Python
            (students[3], courses[2]),  # Emily → UI/UX
            (students[3], courses[4]),  # Emily → Marketing
            (students[4], courses[0]),  # David → Web Dev
            (students[4], courses[1]),  # David → Data Science
        ]

        for student, course in enrollments_data:
            enrollment, created = Enrollment.objects.get_or_create(student=student, course=course)
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✓ Enrollment: {student.full_name} → {course.title[:30]}"))

        # ============================================================
        # 8. Create Progress Records
        # ============================================================
        self.stdout.write('Creating progress records...')
        progress_data = [
            (students[0], courses[0], 65.00),
            (students[0], courses[3], 30.00),
            (students[1], courses[0], 100.00),
            (students[1], courses[2], 75.00),
            (students[1], courses[4], 20.00),
            (students[2], courses[1], 45.00),
            (students[2], courses[3], 90.00),
            (students[3], courses[2], 55.00),
            (students[3], courses[4], 10.00),
            (students[4], courses[0], 80.00),
            (students[4], courses[1], 25.00),
        ]

        for student, course, pct in progress_data:
            progress, created = Progress.objects.get_or_create(
                student=student,
                course=course,
                defaults={'percentage': pct}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"  ✓ Progress: {student.full_name} in {course.title[:25]} → {pct}%"))

        # ============================================================
        # Summary
        # ============================================================
        self.stdout.write('\n' + '=' * 50)
        self.stdout.write(self.style.SUCCESS('✅ Database seeding completed successfully!\n'))
        self.stdout.write(f'📊 Summary:')
        self.stdout.write(f'   Roles:       {Role.objects.count()}')
        self.stdout.write(f'   Users:       {User.objects.count()} (1 admin + {User.objects.filter(role=student_role).count()} students)')
        self.stdout.write(f'   Courses:     {Course.objects.count()}')
        self.stdout.write(f'   Lessons:     {Lesson.objects.count()}')
        self.stdout.write(f'   Assignments: {Assignment.objects.count()}')
        self.stdout.write(f'   Enrollments: {Enrollment.objects.count()}')
        self.stdout.write(f'   Progress:    {Progress.objects.count()}')
        self.stdout.write('\n🔑 Login Credentials:')
        self.stdout.write('   Admin:   admin@lms.com / Admin@123')
        self.stdout.write('   Student: john.doe@student.com / Student@123')
        self.stdout.write('=' * 50 + '\n')
