# Mini LMS — API Documentation

## AVGC XR Solutions Technical Assessment

> **Base URL:** `http://localhost:8000/api`  
> **Authentication:** JWT Bearer Token (Django REST Framework SimpleJWT)  
> **Content-Type:** `application/json` (unless noted otherwise)  
> **Date format:** ISO 8601 — `YYYY-MM-DDTHH:MM:SSZ`  
> **Version:** 1.0.0

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Courses](#2-courses)
3. [Lessons](#3-lessons)
4. [Enrollments](#4-enrollments)
5. [Assignments](#5-assignments)
6. [Submissions](#6-submissions)
7. [Analytics](#7-analytics)
8. [Error Reference](#8-error-reference)

---

## Global Headers

| Header | Required | Description |
|---|---|---|
| `Content-Type` | Yes (POST/PUT) | `application/json` |
| `Authorization` | When noted | `Bearer <access_token>` |
| `Accept` | No | `application/json` |

---

## 1. Authentication

### 1.1 Register

Register a new student account.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/auth/register` |
| **Auth required** | No |

**Request Body**

```json
{
  "full_name": "string (required, max 100)",
  "email":     "string (required, valid email, unique)",
  "password":  "string (required, min 8 chars, must contain uppercase, digit, special char)"
}
```

**Example Request**

```http
POST /api/auth/register HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "full_name": "Sarah Johnson",
  "email":     "sarah.johnson@example.com",
  "password":  "Student@2024"
}
```

**Success Response — `201 Created`**

```json
{
  "id":         2,
  "full_name":  "Sarah Johnson",
  "email":      "sarah.johnson@example.com",
  "role":       "Student",
  "is_active":  true,
  "created_at": "2026-06-04T15:00:00Z"
}
```

**Error Responses**

| Status | Code | Description |
|---|---|---|
| `400` | `validation_error` | Email already in use, or password too weak |
| `422` | `unprocessable_entity` | Malformed JSON body |

**Example Error — `400 Bad Request`**

```json
{
  "email": ["A user with this email already exists."]
}
```

---

### 1.2 Login

Authenticate and obtain JWT access and refresh tokens.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/auth/login` |
| **Auth required** | No |

**Request Body**

```json
{
  "email":    "string (required)",
  "password": "string (required)"
}
```

**Example Request**

```http
POST /api/auth/login HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "email":    "admin@lms.com",
  "password": "Admin@123"
}
```

**Success Response — `200 OK`**

```json
{
  "access":  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id":        1,
    "full_name": "Admin User",
    "email":     "admin@lms.com",
    "role":      "Admin"
  }
}
```

**Error Responses**

| Status | Code | Description |
|---|---|---|
| `400` | `invalid_credentials` | Wrong email or password |
| `403` | `account_inactive` | User account has been deactivated |

**Example Error — `400 Bad Request`**

```json
{
  "detail": "No active account found with the given credentials."
}
```

---

### 1.3 Logout

Blacklist the refresh token (invalidates the session).

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/auth/logout` |
| **Auth required** | Yes (Bearer token) |

**Request Body**

```json
{
  "refresh": "string (required — the refresh token to blacklist)"
}
```

**Example Request**

```http
POST /api/auth/logout HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response — `205 Reset Content`**

```json
{
  "detail": "Successfully logged out."
}
```

---

### 1.4 Refresh Access Token

Exchange a valid refresh token for a new access token.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/auth/token/refresh` |
| **Auth required** | No |

**Request Body**

```json
{
  "refresh": "string (required)"
}
```

**Example Request**

```http
POST /api/auth/token/refresh HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response — `200 OK`**

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**

| Status | Description |
|---|---|
| `401` | Refresh token expired or blacklisted |

---

### 1.5 Get Current User Profile

Retrieve the authenticated user's profile.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/auth/profile` |
| **Auth required** | Yes |

**Example Request**

```http
GET /api/auth/profile HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response — `200 OK`**

```json
{
  "id":         2,
  "full_name":  "Sarah Johnson",
  "email":      "sarah.johnson@example.com",
  "role":       "Student",
  "is_active":  true,
  "created_at": "2026-06-04T15:00:00Z",
  "updated_at": "2026-06-04T15:00:00Z"
}
```

---

## 2. Courses

### 2.1 List All Courses

Returns a paginated list of courses. Publicly accessible; supports search and filter.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/courses/` |
| **Auth required** | No |

**Query Parameters**

| Parameter | Type | Description |
|---|---|---|
| `page` | integer | Page number (default: 1) |
| `page_size` | integer | Results per page (default: 20, max: 100) |
| `search` | string | Full-text search on `title` and `description` |
| `category` | string | Filter by category (e.g. `Programming`) |
| `ordering` | string | Sort field. Prefix with `-` for descending (e.g. `-created_at`) |

**Example Request**

```http
GET /api/courses/?category=Programming&ordering=-created_at&page=1 HTTP/1.1
Host: localhost:8000
```

**Success Response — `200 OK`**

```json
{
  "count":    5,
  "next":     null,
  "previous": null,
  "results": [
    {
      "id":          4,
      "title":       "Python Programming Bootcamp",
      "description": "From absolute beginner to confident Python developer...",
      "thumbnail":   "https://cdn.mini-lms.dev/thumbnails/python-programming.jpg",
      "category":    "Programming",
      "created_by": {
        "id":        1,
        "full_name": "Admin User"
      },
      "lesson_count":    4,
      "enrollment_count": 3,
      "created_at":      "2026-06-04T12:00:00Z",
      "updated_at":      "2026-06-04T12:00:00Z"
    }
  ]
}
```

---

### 2.2 Get Course Detail

Retrieve a single course with all its lessons.

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/courses/{id}/` |
| **Auth required** | No |

**Path Parameters**

| Parameter | Type | Description |
|---|---|---|
| `id` | integer | Course ID |

**Example Request**

```http
GET /api/courses/1/ HTTP/1.1
Host: localhost:8000
```

**Success Response — `200 OK`**

```json
{
  "id":          1,
  "title":       "Full-Stack Web Development",
  "description": "A comprehensive course covering HTML, CSS, JavaScript...",
  "thumbnail":   "https://cdn.mini-lms.dev/thumbnails/web-development.jpg",
  "category":    "Programming",
  "created_by": {
    "id":        1,
    "full_name": "Admin User",
    "email":     "admin@lms.com"
  },
  "lessons": [
    {
      "id":        1,
      "title":     "HTML5 & Semantic Markup",
      "video_url": "https://videos.mini-lms.dev/web-dev/lesson-01-html5.mp4",
      "order_no":  1
    },
    {
      "id":        2,
      "title":     "Modern CSS & Responsive Design",
      "video_url": "https://videos.mini-lms.dev/web-dev/lesson-02-css3.mp4",
      "order_no":  2
    }
  ],
  "lesson_count":     4,
  "enrollment_count": 3,
  "created_at":       "2026-06-04T12:00:00Z",
  "updated_at":       "2026-06-04T12:00:00Z"
}
```

**Error Responses**

| Status | Description |
|---|---|
| `404` | Course not found |

---

### 2.3 Create Course

Create a new course. Admin only.

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/courses/` |
| **Auth required** | Yes — Admin role |

**Request Body**

```json
{
  "title":       "string (required, max 200)",
  "description": "string (required)",
  "thumbnail":   "string (optional, valid URL, max 500)",
  "category":    "string (optional, max 100)"
}
```

**Example Request**

```http
POST /api/courses/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title":       "Cloud Computing with AWS",
  "description": "Master EC2, S3, RDS, Lambda, IAM and more with hands-on labs.",
  "thumbnail":   "https://cdn.mini-lms.dev/thumbnails/aws.jpg",
  "category":    "Cloud"
}
```

**Success Response — `201 Created`**

```json
{
  "id":          6,
  "title":       "Cloud Computing with AWS",
  "description": "Master EC2, S3, RDS, Lambda, IAM and more with hands-on labs.",
  "thumbnail":   "https://cdn.mini-lms.dev/thumbnails/aws.jpg",
  "category":    "Cloud",
  "created_by": {
    "id":        1,
    "full_name": "Admin User"
  },
  "lesson_count":     0,
  "enrollment_count": 0,
  "created_at":       "2026-06-04T16:00:00Z",
  "updated_at":       "2026-06-04T16:00:00Z"
}
```

**Error Responses**

| Status | Description |
|---|---|
| `400` | Validation error (missing title, etc.) |
| `401` | Not authenticated |
| `403` | Authenticated user is not an Admin |

---

### 2.4 Update Course

Fully update a course. Admin only.

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/courses/{id}/` |
| **Auth required** | Yes — Admin role |

**Request Body** — same fields as Create Course (all required for PUT).

**Success Response — `200 OK`** — returns the updated course object.

**Partial Update (PATCH)** — same URL, method `PATCH`, only send fields to change.

---

### 2.5 Delete Course

Soft-deletes a course (hidden from students; recoverable by super-admin).

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/courses/{id}/` |
| **Auth required** | Yes — Admin role |

**Example Request**

```http
DELETE /api/courses/6/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response — `204 No Content`**

*No response body.*

---

## 3. Lessons

### 3.1 List Lessons for a Course

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/courses/{course_id}/lessons/` |
| **Auth required** | No |

**Path Parameters**

| Parameter | Type | Description |
|---|---|---|
| `course_id` | integer | Parent course ID |

**Example Request**

```http
GET /api/courses/1/lessons/ HTTP/1.1
Host: localhost:8000
```

**Success Response — `200 OK`**

```json
[
  {
    "id":        1,
    "course_id": 1,
    "title":     "HTML5 & Semantic Markup",
    "content":   "Learn the building blocks of the web...",
    "video_url": "https://videos.mini-lms.dev/web-dev/lesson-01-html5.mp4",
    "order_no":  1,
    "created_at": "2026-06-04T12:00:00Z"
  },
  {
    "id":        2,
    "course_id": 1,
    "title":     "Modern CSS & Responsive Design",
    "content":   "Dive into CSS3 including Flexbox...",
    "video_url": "https://videos.mini-lms.dev/web-dev/lesson-02-css3.mp4",
    "order_no":  2,
    "created_at": "2026-06-04T12:05:00Z"
  }
]
```

---

### 3.2 Get Lesson Detail

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/lessons/{id}/` |
| **Auth required** | No |

**Success Response — `200 OK`** — same shape as a single object from 3.1.

---

### 3.3 Create Lesson

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/courses/{course_id}/lessons/` |
| **Auth required** | Yes — Admin role |

**Request Body**

```json
{
  "title":     "string (required, max 200)",
  "content":   "string (optional, long-form text)",
  "video_url": "string (optional, valid URL)",
  "order_no":  "integer (required, must be > 0)"
}
```

**Example Request**

```http
POST /api/courses/1/lessons/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title":     "Deploying to AWS EC2",
  "content":   "In this lesson we SSH into an EC2 instance and deploy our Express app using PM2 and Nginx as a reverse proxy...",
  "video_url": "https://videos.mini-lms.dev/web-dev/lesson-05-aws.mp4",
  "order_no":  5
}
```

**Success Response — `201 Created`**

```json
{
  "id":        5,
  "course_id": 1,
  "title":     "Deploying to AWS EC2",
  "content":   "In this lesson we SSH into an EC2 instance...",
  "video_url": "https://videos.mini-lms.dev/web-dev/lesson-05-aws.mp4",
  "order_no":  5,
  "created_at": "2026-06-04T16:30:00Z"
}
```

---

### 3.4 Update Lesson

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/lessons/{id}/` |
| **Auth required** | Yes — Admin role |

Send all fields. Returns updated lesson object (`200 OK`).

---

### 3.5 Delete Lesson

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/lessons/{id}/` |
| **Auth required** | Yes — Admin role |

**Success Response — `204 No Content`**

---

## 4. Enrollments

### 4.1 Enroll in a Course (Student)

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/enrollments/` |
| **Auth required** | Yes — Student role |

**Request Body**

```json
{
  "course_id": "integer (required)"
}
```

**Example Request**

```http
POST /api/enrollments/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "course_id": 2
}
```

**Success Response — `201 Created`** (first enrollment)

```json
{
  "id":          13,
  "student_id":  2,
  "course_id":   2,
  "course_title": "Data Science with Python",
  "enrolled_at": "2026-06-04T17:00:00Z"
}
```

**Success Response — `200 OK`** (already enrolled — idempotent)

```json
{
  "id":          2,
  "student_id":  2,
  "course_id":   2,
  "course_title": "Data Science with Python",
  "enrolled_at": "2026-06-04T10:00:00Z",
  "already_enrolled": true
}
```

**Error Responses**

| Status | Description |
|---|---|
| `400` | `course_id` missing or invalid |
| `404` | Course not found |

---

### 4.2 List My Enrollments (Student)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/enrollments/my/` |
| **Auth required** | Yes — Student role |

**Example Request**

```http
GET /api/enrollments/my/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response — `200 OK`**

```json
[
  {
    "id":          1,
    "course": {
      "id":        1,
      "title":     "Full-Stack Web Development",
      "thumbnail": "https://cdn.mini-lms.dev/thumbnails/web-development.jpg",
      "category":  "Programming"
    },
    "enrolled_at": "2026-06-04T10:00:00Z",
    "progress":    75.00
  },
  {
    "id":          2,
    "course": {
      "id":        2,
      "title":     "Data Science with Python",
      "thumbnail": "https://cdn.mini-lms.dev/thumbnails/data-science.jpg",
      "category":  "Data Science"
    },
    "enrolled_at": "2026-06-04T10:05:00Z",
    "progress":    50.00
  }
]
```

---

### 4.3 List All Enrollments (Admin)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/enrollments/` |
| **Auth required** | Yes — Admin role |

**Query Parameters**

| Parameter | Type | Description |
|---|---|---|
| `student_id` | integer | Filter by student |
| `course_id` | integer | Filter by course |
| `page` | integer | Page number |

**Success Response — `200 OK`** — paginated list of all enrollment objects (same shape as 4.2 but includes student info).

---

## 5. Assignments

### 5.1 List Assignments for a Course

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/courses/{course_id}/assignments/` |
| **Auth required** | Yes |

**Example Request**

```http
GET /api/courses/1/assignments/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response — `200 OK`**

```json
[
  {
    "id":          1,
    "course_id":   1,
    "title":       "Build a Responsive Portfolio Website",
    "description": "Using only HTML5 and CSS3...",
    "deadline":    "2026-07-15T23:59:00Z",
    "max_marks":   100,
    "created_at":  "2026-06-04T12:00:00Z"
  },
  {
    "id":          2,
    "course_id":   1,
    "title":       "REST API with Node.js & Express",
    "description": "Build a fully functional REST API...",
    "deadline":    "2026-08-01T23:59:00Z",
    "max_marks":   100,
    "created_at":  "2026-06-04T12:05:00Z"
  }
]
```

---

### 5.2 Create Assignment (Admin)

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/courses/{course_id}/assignments/` |
| **Auth required** | Yes — Admin role |

**Request Body**

```json
{
  "title":       "string (required, max 200)",
  "description": "string (required)",
  "deadline":    "datetime string (required, ISO 8601, must be future)",
  "max_marks":   "integer (optional, default 100, must be > 0)"
}
```

**Example Request**

```http
POST /api/courses/1/assignments/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title":       "React SPA Capstone Project",
  "description": "Build a single-page application using React 18, React Router, and a public API of your choice. Must include authentication, responsive design, and unit tests.",
  "deadline":    "2026-09-01T23:59:00Z",
  "max_marks":   100
}
```

**Success Response — `201 Created`**

```json
{
  "id":          9,
  "course_id":   1,
  "title":       "React SPA Capstone Project",
  "description": "Build a single-page application...",
  "deadline":    "2026-09-01T23:59:00Z",
  "max_marks":   100,
  "created_at":  "2026-06-04T17:30:00Z"
}
```

---

### 5.3 Get Assignment Detail

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/assignments/{id}/` |
| **Auth required** | Yes |

**Success Response — `200 OK`** — same shape as a single assignment object.

---

### 5.4 Update Assignment (Admin)

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/assignments/{id}/` |
| **Auth required** | Yes — Admin role |

Send all fields. Returns updated assignment (`200 OK`).

---

### 5.5 Delete Assignment (Admin)

| | |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/assignments/{id}/` |
| **Auth required** | Yes — Admin role |

**Success Response — `204 No Content`**

---

## 6. Submissions

### 6.1 Submit Assignment (Student)

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/assignments/{id}/submissions/` |
| **Auth required** | Yes — Student role |
| **Content-Type** | `multipart/form-data` (file upload) |

> **Note:** In the recommended architecture, the frontend first calls `/assignments/{id}/presigned-upload/` to get a presigned S3 URL, uploads the file directly to S3, then calls this endpoint with the resulting `file_key`.

**Request Body** (`multipart/form-data`)

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | file | Yes (if not using presigned URL) | Assignment file (max 200 MB) |
| `file_url` | string | Yes (if using presigned URL) | S3 URL of uploaded file |

**Example Request (presigned URL flow)**

```http
POST /api/assignments/1/submissions/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "file_url": "https://lms-uploads.s3.amazonaws.com/submissions/1/abc123.zip"
}
```

**Success Response — `201 Created`**

```json
{
  "id":            1,
  "assignment_id": 1,
  "student_id":    2,
  "file_url":      "https://lms-uploads.s3.amazonaws.com/submissions/1/abc123.zip",
  "submitted_at":  "2026-06-04T18:00:00Z",
  "status":        "Submitted"
}
```

**Error Responses**

| Status | Description |
|---|---|
| `400` | File type not allowed, file too large, or already submitted |
| `403` | Student not enrolled in this course |
| `404` | Assignment not found |
| `410` | Deadline has passed |

---

### 6.2 List Submissions for an Assignment (Admin)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/assignments/{id}/submissions/` |
| **Auth required** | Yes — Admin role |

**Success Response — `200 OK`**

```json
[
  {
    "id":           1,
    "assignment_id": 1,
    "student": {
      "id":        2,
      "full_name": "Sarah Johnson",
      "email":     "sarah.johnson@example.com"
    },
    "file_url":     "https://lms-uploads.s3.amazonaws.com/submissions/1/sarah-portfolio.zip",
    "submitted_at": "2026-06-04T18:00:00Z",
    "status":       "Reviewed"
  },
  {
    "id":           2,
    "assignment_id": 1,
    "student": {
      "id":        3,
      "full_name": "Michael Chen",
      "email":     "michael.chen@example.com"
    },
    "file_url":     "https://lms-uploads.s3.amazonaws.com/submissions/1/michael-portfolio.zip",
    "submitted_at": "2026-06-04T19:00:00Z",
    "status":       "Reviewed"
  }
]
```

---

### 6.3 List My Submissions (Student)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/submissions/my/` |
| **Auth required** | Yes — Student role |

**Success Response — `200 OK`**

```json
[
  {
    "id":           1,
    "assignment": {
      "id":       1,
      "title":    "Build a Responsive Portfolio Website",
      "deadline": "2026-07-15T23:59:00Z",
      "course": {
        "id":    1,
        "title": "Full-Stack Web Development"
      }
    },
    "file_url":     "https://lms-uploads.s3.amazonaws.com/submissions/1/sarah-portfolio.zip",
    "submitted_at": "2026-06-04T18:00:00Z",
    "status":       "Reviewed"
  }
]
```

---

### 6.4 Get Submission Detail

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/submissions/{id}/` |
| **Auth required** | Yes (Admin sees all; Student sees only own) |

**Success Response — `200 OK`** — same shape as single submission object including student and assignment details.

---

## 7. Analytics

### 7.1 Admin Analytics Dashboard

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/analytics/admin/` |
| **Auth required** | Yes — Admin role |

**Example Request**

```http
GET /api/analytics/admin/ HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response — `200 OK`**

```json
{
  "summary": {
    "total_students":    5,
    "total_courses":     5,
    "total_enrollments": 12,
    "total_submissions": 12,
    "submissions_pending_review": 8
  },
  "enrollments_by_course": [
    { "course_id": 1, "course_title": "Full-Stack Web Development", "enrollment_count": 3 },
    { "course_id": 2, "course_title": "Data Science with Python",   "enrollment_count": 2 },
    { "course_id": 3, "course_title": "UI/UX Design Fundamentals",  "enrollment_count": 2 },
    { "course_id": 4, "course_title": "Python Programming Bootcamp","enrollment_count": 3 },
    { "course_id": 5, "course_title": "Digital Marketing Strategy", "enrollment_count": 2 }
  ],
  "average_progress_by_course": [
    { "course_id": 1, "course_title": "Full-Stack Web Development",  "avg_progress": 75.00 },
    { "course_id": 2, "course_title": "Data Science with Python",    "avg_progress": 62.50 },
    { "course_id": 3, "course_title": "UI/UX Design Fundamentals",   "avg_progress": 50.00 },
    { "course_id": 4, "course_title": "Python Programming Bootcamp", "avg_progress": 50.00 },
    { "course_id": 5, "course_title": "Digital Marketing Strategy",  "avg_progress": 50.00 }
  ],
  "recent_submissions": [
    {
      "submission_id":    12,
      "student_name":     "Amara Okafor",
      "assignment_title": "CLI Task Manager Application",
      "submitted_at":     "2026-06-04T18:45:00Z",
      "status":           "Submitted"
    }
  ]
}
```

---

### 7.2 Student Analytics Dashboard

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/analytics/student/` |
| **Auth required** | Yes — Student role |

**Success Response — `200 OK`**

```json
{
  "student": {
    "id":        2,
    "full_name": "Sarah Johnson"
  },
  "summary": {
    "enrolled_courses":   3,
    "completed_courses":  0,
    "total_submissions":  3,
    "average_progress":   50.00
  },
  "course_progress": [
    {
      "course_id":    1,
      "course_title": "Full-Stack Web Development",
      "progress":     75.00,
      "enrolled_at":  "2026-06-04T10:00:00Z"
    },
    {
      "course_id":    2,
      "course_title": "Data Science with Python",
      "progress":     50.00,
      "enrolled_at":  "2026-06-04T10:05:00Z"
    },
    {
      "course_id":    4,
      "course_title": "Python Programming Bootcamp",
      "progress":     25.00,
      "enrolled_at":  "2026-06-04T10:10:00Z"
    }
  ],
  "recent_submissions": [
    {
      "submission_id":    5,
      "assignment_title": "CLI Task Manager Application",
      "course_title":     "Python Programming Bootcamp",
      "submitted_at":     "2026-06-04T18:30:00Z",
      "status":           "Submitted"
    }
  ]
}
```

---

## 8. Error Reference

### Standard Error Response Shape

All errors follow a consistent JSON shape:

```json
{
  "detail": "Human-readable error message.",
  "code":   "machine_readable_error_code"
}
```

Validation errors return field-level messages:

```json
{
  "email":    ["Enter a valid email address."],
  "password": ["This field is required."]
}
```

### HTTP Status Code Reference

| Status | Meaning | Common Cause |
|---|---|---|
| `200 OK` | Request succeeded | GET, PUT success |
| `201 Created` | Resource created | POST success |
| `204 No Content` | Success, no body | DELETE success |
| `205 Reset Content` | Success, client should reset | Logout |
| `400 Bad Request` | Validation failed | Invalid request body |
| `401 Unauthorized` | Not authenticated | Missing or expired token |
| `403 Forbidden` | Authenticated but not authorised | Role mismatch |
| `404 Not Found` | Resource does not exist | Invalid ID |
| `409 Conflict` | Duplicate resource | Duplicate enrollment |
| `410 Gone` | Resource no longer available | Past deadline |
| `422 Unprocessable Entity` | Malformed request | Invalid JSON |
| `429 Too Many Requests` | Rate limit exceeded | API abuse |
| `500 Internal Server Error` | Unhandled server error | Bug |

---

## Appendix — Authentication Flow Diagram

```
┌────────────────────────────────────────────────────────────┐
│                     JWT Auth Flow                          │
│                                                            │
│  POST /auth/login                                          │
│  ─────────────────                                         │
│  email + password  ──►  Django validates credentials       │
│                    ◄──  { access (15 min), refresh (7d) }  │
│                                                            │
│  Authenticated request                                     │
│  ─────────────────────                                     │
│  Authorization: Bearer <access>  ──►  DRF verifies JWT     │
│                                  ◄──  Response data        │
│                                                            │
│  Access token expired                                      │
│  ────────────────────                                      │
│  POST /auth/token/refresh                                  │
│  { refresh }  ──►  DRF rotates token                       │
│               ◄──  { access (new 15 min) }                 │
│                                                            │
│  POST /auth/logout                                         │
│  ─────────────────                                         │
│  { refresh }  ──►  Blacklisted in DB                       │
│               ◄──  205 Reset Content                       │
└────────────────────────────────────────────────────────────┘
```

---

*End of API Documentation — Mini LMS v1.0.0*
