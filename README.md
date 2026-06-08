# 🎓 Mini LMS — Learning Management System

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-4.2-092E20?style=flat&logo=django)](https://www.djangoproject.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql)](https://www.mysql.com/)
[![DRF](https://img.shields.io/badge/DRF-3.14-red?style=flat)](https://www.django-rest-framework.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat&logo=vite)](https://vitejs.dev/)

**Live Demo:**
- 🌐 Frontend: `https://mini-lms-navy.vercel.app/`
- 🔧 Backend API: `https://mini-lms-backend-rizu.onrender.com`

A **production-ready, full-stack Learning Management System** built as a technical assessment project. Features a modern React frontend with a Django REST API backend, MySQL database, role-based authentication, file uploads, and an AI chatbot assistant.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [ER Diagram](#er-diagram)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Folder Structure](#folder-structure)
- [Deployment](#deployment)
- [Security](#security)
- [Problem Solving](#problem-solving)

---

## 🌟 Project Overview

Mini LMS enables:
- **Admins** to manage courses, lessons, assignments, students, and submissions
- **Students** to register, browse/enroll in courses, access lessons, and submit assignments


**Test Credentials:**
| Role    | Email                     | Password  |
|---------|---------------------------|-----------|
| Admin   | Admin456@lms.com          | Admin@123 |
| Student | archihassani901@gmail.com | Archi@123 |

---

## ✨ Features

### Admin Features
| Feature | Status |
|---------|--------|
| Admin Login & Dashboard | ✅ |
| Create / Edit / Delete Courses | ✅ |
| Create / Edit / Delete Lessons | ✅ |
| Manage Assignments | ✅ |
| View All Students | ✅ |
| View All Enrollments | ✅ |
| View & Download Submissions | ✅ |
| Analytics Dashboard | ✅ |

### Student Features
| Feature | Status |
|---------|--------|
| Register & Login | ✅ |
| Student Dashboard | ✅ |
| Browse & Search Courses | ✅ |
| View Course Details | ✅ |
| Enroll in Courses | ✅ |
| View Enrolled Courses | ✅ |
| Access Lessons | ✅ |
| Submit Assignments (file upload) | ✅ |
| Track Progress | ✅ |

### Bonus Features
| Feature | Status |
|---------|--------|
| Dark Mode | ✅ |
| Course Progress Tracking | ✅ |
| AI FAQ Chatbot | ✅ |
| Course Search & Filter | ✅ |
| Analytics Dashboard | ✅ |
| Certificate Generation | ✅ |
| Email Notification System | ✅ |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | Frontend framework & build tool |
| React Router v6 | Client-side routing |
| Bootstrap 5 | UI components & layout |
| Custom CSS | Dark theme, glassmorphism, animations |
| React Context API | State management (auth, theme) |
| Fetch API | HTTP requests |
| react-hot-toast | Notifications |
| react-icons | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| Django 4.2 | Web framework (MVT pattern) |
| Django REST Framework | REST API |
| djangorestframework-simplejwt | JWT authentication |
| django-cors-headers | CORS handling |
| mysqlclient | MySQL connector |
| python-decouple | Environment variables |
| Gunicorn | Production WSGI server |
| django-filter | API filtering |

### Database
| Technology | Purpose |
|-----------|---------|
| MySQL 8.0 | Primary database |
| Railway MySQL | Cloud database (production) |

### DevOps
| Technology | Purpose |
|-----------|---------|
| Vercel | Frontend deployment |
| Render | Backend deployment |
| Railway | Database hosting |
| Git + GitHub | Version control |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                          │
│  React 18 + Vite │ React Router │ Bootstrap │ Fetch API  │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS / JSON
┌───────────────────────────▼─────────────────────────────┐
│                     API LAYER                             │
│           Django REST Framework (DRF)                     │
│  JWT Auth │ CORS │ Role Permissions │ File Validation     │
├─────────────────────────────────────────────────────────┤
│                   APPLICATION LAYER                       │
│  authentication │ courses │ lessons │ enrollments         │
│  assignments    │ analytics │ notifications               │
└───────────────────────────┬─────────────────────────────┘
                            │ ORM (Django)
┌───────────────────────────▼─────────────────────────────┐
│                   DATABASE LAYER                          │
│                MySQL 8.0 (3NF Normalized)                 │
│  roles │ users │ courses │ lessons │ enrollments          │
│  assignments │ submissions │ progress                     │
└─────────────────────────────────────────────────────────┘
```

---

See [database/schema.sql](database/schema.sql) for the complete MySQL schema.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- pip & npm

### 1. Clone the Repository

```bash
git clone https://github.com/Archi-Hassani9/mini-lms.git
cd mini-lms
```

### 2. Database Setup

```sql
-- In MySQL client:
CREATE DATABASE mini_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Run schema:
mysql -u root -p mini_lms < database/schema.sql
```

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# Run migrations
python manage.py migrate

# Seed sample data
python manage.py seed_data

# Start development server
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env if backend URL differs

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 5. Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:5173 | React frontend |
| http://localhost:8000/api | Django REST API |
| http://localhost:8000/admin | Django Admin Panel |

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# Django
SECRET_KEY=your-super-secret-key-change-this
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=mini_lms
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=127.0.0.1
DB_PORT=3306

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173

```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Mini LMS
```

---

## 📚 API Documentation

Full API documentation: [docs/api_documentation.md](docs/api_documentation.md)

### Quick Reference

| Method | Endpoint | Auth | Description |
|--------|---------|------|-------------|
| POST | /api/auth/register | Public | Student registration |
| POST | /api/auth/login | Public | Login (any role) |
| POST | /api/auth/logout | JWT | Logout |
| POST | /api/auth/token/refresh | JWT | Refresh access token |
| GET | /api/auth/profile | JWT | Get own profile |
| GET | /api/courses/ | Public | List all courses |
| POST | /api/courses/ | Admin | Create course |
| GET | /api/courses/:id/ | Public | Course detail |
| PUT | /api/courses/:id/ | Admin | Update course |
| DELETE | /api/courses/:id/ | Admin | Delete course |
| GET | /api/courses/:id/lessons/ | Enrolled/Admin | List lessons |
| POST | /api/courses/:id/lessons/ | Admin | Create lesson |
| POST | /api/enrollments/enroll/ | Student | Enroll in course |
| GET | /api/enrollments/my/ | Student | My enrollments |
| GET | /api/enrollments/ | Admin | All enrollments |
| POST | /api/assignments/:id/submissions/ | Student | Submit assignment |
| GET | /api/assignments/:id/submissions/ | Admin | View all submissions |
| GET | /api/analytics/admin/ | Admin | Admin dashboard data |
| GET | /api/analytics/student/ | Student | Student dashboard data |

---

## 📁 Folder Structure

```
mini-lms/
│
├── backend/                          # Django Backend
│   ├── lms_backend/                  # Django project config
│   │   ├── settings.py               # Main settings
│   │   ├── urls.py                   # Root URL configuration
│   │   ├── wsgi.py                   # WSGI entry point
│   │   └── asgi.py                   # ASGI entry point
│   │
│   ├── authentication/               # Auth app (JWT, User model)
│   │   ├── models.py                 # Role, User models
│   │   ├── serializers.py            # Auth serializers
│   │   ├── views.py                  # Register, Login, Profile views
│   │   ├── permissions.py            # IsAdmin, IsStudent permissions
│   │   ├── urls.py                   # Auth URL patterns
│   │   ├── admin.py                  # Django admin registration
│   │   └── management/
│   │       └── commands/
│   │           └── seed_data.py      # Sample data seeder
│   │
│   ├── courses/                      # Course management
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── lessons/                      # Lesson management
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── enrollments/                  # Enrollment & progress
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── assignments/                  # Assignments & submissions
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── analytics/                    # Dashboard statistics
│   │   ├── views.py
│   │   └── urls.py
│   │
│   ├── notifications/                # Email notifications
│   │   └── services.py
│   │
│   ├── media/                        # Uploaded files (local dev)
│   │   └── submissions/
│   │
│   ├── requirements.txt              # Python dependencies
│   ├── .env.example                  # Environment template
│   ├── Procfile                      # Render deployment
│   ├── render.yaml                   # Render config
│   └── manage.py                     # Django CLI
│
├── frontend/                         # React Frontend (Vite)
│   ├── public/
│   │   ├── robots.txt                # SEO robots file
│   │   └── sitemap.xml               # SEO sitemap
│   │
│   ├── src/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Auth state management
│   │   │   └── ThemeContext.jsx      # Dark/light mode
│   │   │
│   │   ├── services/
│   │   │   └── api.js                # Fetch API service layer
│   │   │
│   │   ├── hooks/
│   │   │   ├── usePageTitle.js       # Dynamic page titles
│   │   │   └── useDebounce.js        # Search debounce
│   │   │
│   │   ├── utils/
│   │   │   ├── helpers.js            # Utility functions
│   │   │   └── constants.js          # App constants
│   │   │
│   │   ├── components/
│   │   │   ├── layouts/
│   │   │   │   ├── PublicLayout.jsx  # Navbar + Footer wrapper
│   │   │   │   ├── StudentLayout.jsx # Student sidebar layout
│   │   │   │   └── AdminLayout.jsx   # Admin sidebar layout
│   │   │   └── common/
│   │   │       ├── Navbar.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       ├── Footer.jsx
│   │   │       ├── ProtectedRoute.jsx
│   │   │       ├── Spinner.jsx
│   │   │       ├── ChatBot.jsx
│   │   │       ├── CourseCard.jsx
│   │   │       ├── DataTable.jsx
│   │   │       └── CertificateModal.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── HomePage.jsx
│   │   │   │   ├── AboutPage.jsx
│   │   │   │   ├── CoursesPage.jsx
│   │   │   │   ├── CourseDetailPage.jsx
│   │   │   │   ├── ContactPage.jsx
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   ├── NotFoundPage.jsx
│   │   │   │   └── UnauthorizedPage.jsx
│   │   │   │
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   ├── MyCoursesPage.jsx
│   │   │   │   ├── CourseLearningPage.jsx
│   │   │   │   ├── AssignmentSubmitPage.jsx
│   │   │   │   └── ProfilePage.jsx
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── CourseManagementPage.jsx
│   │   │       ├── LessonManagementPage.jsx
│   │   │       ├── AssignmentManagementPage.jsx
│   │   │       ├── StudentManagementPage.jsx
│   │   │       └── SubmissionManagementPage.jsx
│   │   │
│   │   ├── App.jsx                   # Root router config
│   │   ├── main.jsx                  # Entry point
│   │   └── index.css                 # Global styles + CSS variables
│   │
│   ├── index.html                    # HTML entry point
│   ├── vite.config.js                # Vite configuration
│   ├── .env.example                  # Environment template
│   └── vercel.json                   # Vercel deployment config
│
├── database/
│   ├── schema.sql                    # Complete MySQL schema
│   ├── seed.sql                      # Sample data
│   └── er_diagram.png                # Entity-Relationship Diagram
│
├── docs/
│   ├── ER_Mini-LMS.drawio            # ER diagram
│   └── problem_solving_answers.txt   # Technical Q&A
│
└── README.md                         # This file
```

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
npm run build
vercel --prod

# Configure environment in Vercel dashboard:
# VITE_API_URL = https://your-backend.onrender.com/api
```

### Backend (Render)

1. Push code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Connect GitHub repository
4. Set **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
5. Set **Start Command**: `gunicorn lms_backend.wsgi --bind 0.0.0.0:$PORT`
6. Add all environment variables from `.env.example`
7. Deploy!

### Database (Railway)

1. Create new project on [railway.app](https://railway.app)
2. Add MySQL service
3. Copy connection variables to Render environment variables:
   - `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

---


## 🔒 Security

| Security Measure | Implementation |
|-----------------|----------------|
| Password Hashing | Django PBKDF2 with SHA256 (720,000 iterations) |
| JWT Authentication | djangorestframework-simplejwt with token blacklisting |
| CSRF Protection | Django CSRF middleware |
| XSS Prevention | DRF serializer validation + Bootstrap escaping |
| SQL Injection | Django ORM (parameterized queries) |
| Role-Based Authorization | Custom `IsAdmin`, `IsStudent` permission classes |
| Secure File Upload | Extension + MIME type validation, 200MB limit, UUID filenames |
| CORS | django-cors-headers with allowed origins whitelist |
| Environment Variables | python-decouple (no secrets in code) |
| HTTPS | Enforced in production (Render + Vercel) |

---

## 📄 License

This project is created as a technical assessment for an internship position.

---

*Built with ❤️ using React + Django | Mini LMS Technical Assessment 2026*
