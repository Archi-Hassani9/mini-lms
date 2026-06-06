# Problem-Solving Answers — Mini LMS
## AVGC XR Solutions Technical Assessment

> **Author:** Backend Engineer Candidate  
> **Date:** June 2026  
> **Stack:** Django REST Framework · MySQL · Redis · AWS

---

## Table of Contents

1. [Optimising a Slow Course Page for 10,000 Students](#q1-optimising-a-slow-course-page-for-10000-students)
2. [Preventing Duplicate Enrollments](#q2-preventing-duplicate-enrollments)
3. [Scaling from 100 to 5,000 Users/Day](#q3-scaling-from-100-to-5000-usersday)
4. [Handling 200 MB Assignment Uploads](#q4-handling-200-mb-assignment-uploads-efficiently-and-securely)
5. [Recovering from Accidental Course Deletion](#q5-recovering-from-accidental-course-deletion)

---

## Q1: Optimising a Slow Course Page for 10,000 Students

### Problem Statement
The course detail page (which shows course info, all lessons, instructor details, and enrolled student count) becomes progressively slower as the student base grows to 10,000+ users.

### Root-Cause Diagnosis
Before optimising, profile the bottleneck. Django Debug Toolbar or the `django-silk` middleware will expose:
- N+1 query patterns (e.g., hitting the DB once per lesson to load the instructor)
- Missing indexes on frequently-filtered columns
- Uncompressed static assets being served from the application server
- Absence of caching on expensive aggregations (e.g., `SELECT COUNT(*) FROM enrollments WHERE course_id = ?`)

---

### Solution 1 — Database Indexing

Ensure the following indexes exist (already present in `schema.sql`):

```sql
-- courses table
INDEX idx_courses_category   (category),
INDEX idx_courses_created_by (created_by),

-- lessons table
INDEX idx_lessons_course_id  (course_id),

-- enrollments table
INDEX idx_enrollments_course_id  (course_id),
INDEX idx_enrollments_student_id (student_id)
```

Run `EXPLAIN SELECT …` for every query on the course page to confirm the query planner is using these indexes instead of performing full-table scans.

---

### Solution 2 — Query Optimisation (select_related / prefetch_related)

Eliminate N+1 queries using Django ORM's eager-loading utilities:

```python
# views.py — BEFORE (N+1 anti-pattern)
course = Course.objects.get(pk=course_id)
lessons = Lesson.objects.filter(course_id=course_id)  # 1 query
for lesson in lessons:
    print(lesson.course.created_by.full_name)          # N queries!

# views.py — AFTER (single round-trip)
course = (
    Course.objects
    .select_related("created_by")           # JOIN users on courses.created_by
    .prefetch_related(
        Prefetch(
            "lessons",
            queryset=Lesson.objects.order_by("order_no"),
        )
    )
    .get(pk=course_id)
)
```

For the enrollment count, use a database-level annotation rather than a Python-level `len()`:

```python
from django.db.models import Count

course = (
    Course.objects
    .annotate(enrollment_count=Count("enrollments"))
    .select_related("created_by")
    .get(pk=course_id)
)
```

---

### Solution 3 — Redis Caching

Cache the rendered course response (or at minimum the expensive DB query result) in Redis. The cache key is invalidated whenever the course, its lessons, or enrollment count changes.

```python
# utils/cache.py
from django.core.cache import cache
import hashlib

COURSE_CACHE_TTL = 60 * 15  # 15 minutes

def get_course_cache_key(course_id: int) -> str:
    return f"course_detail:{course_id}"

# In the view:
def get(self, request, pk):
    cache_key = get_course_cache_key(pk)
    data = cache.get(cache_key)
    if data is None:
        course = (
            Course.objects
            .select_related("created_by")
            .prefetch_related("lessons")
            .annotate(enrollment_count=Count("enrollments"))
            .get(pk=pk)
        )
        data = CourseDetailSerializer(course).data
        cache.set(cache_key, data, COURSE_CACHE_TTL)
    return Response(data)
```

**Cache invalidation** — use Django signals:

```python
# signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache

@receiver([post_save, post_delete], sender=Course)
def invalidate_course_cache(sender, instance, **kwargs):
    cache.delete(get_course_cache_key(instance.pk))

@receiver([post_save, post_delete], sender=Lesson)
def invalidate_lesson_course_cache(sender, instance, **kwargs):
    cache.delete(get_course_cache_key(instance.course_id))
```

---

### Solution 4 — Pagination

Never return all lessons or all enrolled students in one response. Use DRF's `PageNumberPagination` or `CursorPagination`:

```python
# settings.py
REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
}
```

---

### Solution 5 — CDN for Static and Media Assets

Configure WhiteNoise (development) or AWS CloudFront + S3 (production) so that course thumbnails, lesson videos, and assignment files are served from edge nodes, not your application server. This reduces server load significantly and improves Time to First Byte globally.

---

### Solution 6 — Database Connection Pooling

Use `django-db-connection-pool` (backed by SQLAlchemy's pool) or `PgBouncer` (for PostgreSQL) to reuse DB connections and avoid the overhead of creating a new TCP connection per request:

```python
# settings.py (with django-db-connection-pool)
DATABASES = {
    "default": {
        "ENGINE": "dj_db_conn_pool.backends.mysql",
        "POOL_OPTIONS": {
            "POOL_SIZE": 10,
            "MAX_OVERFLOW": 5,
            "RECYCLE": 24 * 60 * 60,
        },
        # … host, port, name, user, password
    }
}
```

---

### Solution 7 — Read Replicas

For MySQL, promote a read replica and route `SELECT` queries to it via Django's database router:

```python
# routers.py
class ReadReplicaRouter:
    READ_MODELS = {"Course", "Lesson", "Enrollment", "Progress"}

    def db_for_read(self, model, **hints):
        if model.__name__ in self.READ_MODELS:
            return "replica"
        return "default"

    def db_for_write(self, model, **hints):
        return "default"

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return db == "default"
```

---

### Summary

| Technique | Impact | Effort |
|---|---|---|
| DB indexes | High | Low |
| select_related / prefetch_related | High | Low |
| Redis caching (15 min TTL) | Very High | Medium |
| Pagination | High | Low |
| CDN for assets | High | Medium |
| Connection pooling | Medium | Low |
| Read replica | High | High |

---

## Q2: Preventing Duplicate Enrollments

### Problem Statement
Prevent a student from enrolling in the same course more than once, even under concurrent API requests.

### Multi-Layer Defence Strategy

**Layer 1 — Database UNIQUE Constraint (the ultimate guarantee)**

The `enrollments` table has a composite unique key:

```sql
UNIQUE KEY uq_enrollments_student_course (student_id, course_id)
```

Even if two concurrent API requests pass all application-layer checks simultaneously, the database will reject the second `INSERT` with a `1062 Duplicate entry` error. This is the only layer that is truly race-condition-proof.

**Layer 2 — DRF Serializer Validation**

```python
# serializers.py
from rest_framework import serializers
from .models import Enrollment

class EnrollmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ["course_id"]

    def validate(self, attrs):
        student = self.context["request"].user
        course_id = attrs["course_id"]

        if Enrollment.objects.filter(
            student_id=student.id, course_id=course_id
        ).exists():
            raise serializers.ValidationError(
                {"detail": "You are already enrolled in this course."}
            )
        return attrs
```

**Layer 3 — Idempotent API Design (get_or_create)**

Use Django's `get_or_create` to handle duplicate requests gracefully rather than raising a 400 error on every retry:

```python
# views.py
from django.db import IntegrityError

class EnrollmentView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def post(self, request):
        serializer = EnrollmentCreateSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        enrollment, created = Enrollment.objects.get_or_create(
            student_id=request.user.id,
            course_id=serializer.validated_data["course_id"],
        )
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(
            EnrollmentSerializer(enrollment).data, status=status_code
        )
```

**Layer 4 — Frontend UX**

- After a successful enrollment, the "Enroll" button is replaced with a "Go to Course" button (state stored in the student's dashboard API response).
- The enrollment API response includes `"already_enrolled": true/false` so the frontend can update its state without an extra API call.
- Use React's `useEffect` or a Zustand store to reflect enrollment state instantly, preventing double-clicks.

```javascript
// React component snippet
const handleEnroll = async () => {
  setLoading(true);
  try {
    const res = await api.post("/enrollments/", { course_id: courseId });
    setEnrolled(true);
    toast.success(res.status === 201 ? "Enrolled!" : "Already enrolled.");
  } catch (err) {
    toast.error(err.response?.data?.detail || "Enrollment failed.");
  } finally {
    setLoading(false);
  }
};
```

**Layer 5 — Redis Distributed Lock (for high-concurrency production)**

For very high-throughput scenarios, acquire a Redis lock before the DB write to serialise concurrent enrollment attempts for the same (student, course) pair:

```python
import redis
from contextlib import contextmanager

r = redis.Redis.from_url(settings.REDIS_URL)

@contextmanager
def enrollment_lock(student_id, course_id, timeout=5):
    lock_key = f"enroll_lock:{student_id}:{course_id}"
    lock = r.lock(lock_key, timeout=timeout)
    acquired = lock.acquire(blocking=True, blocking_timeout=3)
    if not acquired:
        raise Exception("Could not acquire enrollment lock")
    try:
        yield
    finally:
        lock.release()

# In the view:
with enrollment_lock(request.user.id, course_id):
    enrollment, created = Enrollment.objects.get_or_create(...)
```

---

## Q3: Scaling from 100 to 5,000 Users/Day

### Problem Statement
The LMS initially handles 100 daily active users on a single VPS. Traffic grows 50× to 5,000 DAU. What architectural changes are required?

### Phase 1 — Quick Wins (0–1 month, 100→500 DAU)

**Redis for Session & Cache**

Move from database-backed sessions to Redis sessions immediately:

```python
# settings.py
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://redis:6379/1",
        "OPTIONS": {"CLIENT_CLASS": "django_redis.client.DefaultClient"},
    }
}
```

**Gunicorn Workers**

Scale Gunicorn workers to `2 × CPU_CORES + 1` and use gevent workers for I/O-bound tasks:

```bash
gunicorn lms.wsgi:application \
  --workers 9 \
  --worker-class gevent \
  --bind 0.0.0.0:8000
```

**Static Files via CDN**

Move all Django static files and user-uploaded media to AWS S3 + CloudFront. This alone can cut server load by 40–60%.

---

### Phase 2 — Horizontal Scaling (1–3 months, 500→2,000 DAU)

**Load Balancer**

Deploy two or more application servers behind an Nginx or AWS ALB load balancer. All app servers share the same Redis instance and database. Session stickiness is not needed because sessions are stored in Redis.

```
                        ┌─────────────────┐
Clients ──► AWS ALB ───►│  App Server 1   │──►┐
                        └─────────────────┘    │
                        ┌─────────────────┐    ├──► RDS MySQL (Primary)
                    ───►│  App Server 2   │──►─┤
                        └─────────────────┘    │
                        ┌─────────────────┐    └──► ElastiCache Redis
                    ───►│  App Server N   │──►─┘
                        └─────────────────┘
```

**MySQL Read Replica**

Offload all `SELECT` queries (course listings, progress, analytics) to a read replica. Writes go only to the primary:

```python
DATABASES = {
    "default": { /* primary — writes */ },
    "replica": { /* read replica — reads */ },
}
DATABASE_ROUTERS = ["lms.routers.ReadReplicaRouter"]
```

---

### Phase 3 — Async Processing & Observability (3–6 months, 2,000→5,000 DAU)

**Celery + Redis as Message Queue**

Offload slow tasks (email notifications, file virus scanning, progress recalculation, report generation) to background Celery workers:

```python
# tasks.py
from celery import shared_task

@shared_task
def send_enrollment_confirmation(user_id: int, course_id: int):
    user = User.objects.get(pk=user_id)
    course = Course.objects.get(pk=course_id)
    send_mail(
        subject=f"Enrolled: {course.title}",
        message=f"Hi {user.full_name}, you are now enrolled in {course.title}.",
        recipient_list=[user.email],
    )
```

**Monitoring & Alerting**

| Tool | Purpose |
|---|---|
| Sentry | Exception tracking and performance monitoring |
| Datadog / Prometheus + Grafana | Infrastructure metrics (CPU, memory, DB connections) |
| AWS CloudWatch | RDS, ElastiCache, ALB metrics |
| UptimeRobot | Uptime alerting |

**Auto-scaling**

Use AWS ECS Fargate with a target-tracking scaling policy (trigger: average CPU > 60%) so new containers spin up automatically during traffic spikes.

---

## Q4: Handling 200 MB Assignment Uploads Efficiently and Securely

### Problem Statement
Students submit large assignment files (up to 200 MB). Naive direct uploads to the Django server cause memory exhaustion, timeouts, and security risks.

### Architecture: Direct-to-S3 Presigned Upload

The Django server never handles the file bytes. Instead:

1. Student requests a **presigned upload URL** from Django.
2. Browser uploads directly to **AWS S3** (or Cloudinary for media).
3. S3 triggers a **Lambda function** (or Celery task via S3 event notification) to virus-scan and validate the file.
4. On scan success, the Lambda/Celery task updates the `submissions` table with the verified `file_url`.

```
Student Browser
      │
      │ 1. POST /api/assignments/7/presigned-upload/
      │    { "filename": "my_project.zip", "content_type": "application/zip" }
      ▼
  Django API  ──► generates presigned PUT URL (15-min expiry)
      │
      │ 2. Returns: { "upload_url": "https://s3.amazonaws.com/…?X-Amz-…",
      │               "file_key": "submissions/uuid/my_project.zip" }
      ▼
Student Browser  ──► 3. PUT file_bytes directly to S3 (no Django involved)
      │
      │ 4. POST /api/assignments/7/submissions/
      │    { "file_key": "submissions/uuid/my_project.zip" }
      ▼
  Django API  ──► Creates submission record with status='Submitted'
      ▼
  S3 Event  ──► Lambda / Celery task: virus scan + MIME validation
      ▼
  Update submission.status = 'Reviewed' or 'Rejected'
```

### Django Presigned URL Generation

```python
import boto3
import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class PresignedUploadView(APIView):
    ALLOWED_MIME_TYPES = {
        "application/pdf",
        "application/zip",
        "application/x-zip-compressed",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
    }
    MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024  # 200 MB

    def post(self, request, assignment_id):
        filename = request.data.get("filename", "")
        content_type = request.data.get("content_type", "")

        # Validate content type against allowlist
        if content_type not in self.ALLOWED_MIME_TYPES:
            return Response(
                {"detail": "File type not permitted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ext = filename.rsplit(".", 1)[-1].lower()
        safe_key = f"submissions/{assignment_id}/{uuid.uuid4().hex}.{ext}"

        s3 = boto3.client("s3", region_name=settings.AWS_S3_REGION)
        presigned = s3.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.AWS_STORAGE_BUCKET_NAME,
                "Key": safe_key,
                "ContentType": content_type,
                "ContentLength": self.MAX_FILE_SIZE_BYTES,
            },
            ExpiresIn=900,  # 15 minutes
        )
        return Response({"upload_url": presigned, "file_key": safe_key})
```

### File Validation Checklist

| Check | Implementation |
|---|---|
| Extension allowlist | Validate `.pdf`, `.zip`, `.docx`, `.png`, `.jpg` only |
| MIME-type verification | Check `Content-Type` header **and** read file magic bytes server-side |
| File size limit | S3 `ContentLength` condition in presigned URL |
| Unique filenames | `uuid.uuid4().hex` prefix prevents path traversal and overwrites |
| Antivirus scanning | ClamAV via `python-clamd` in Celery task, or AWS GuardDuty Malware Protection on the S3 bucket |
| Private bucket | S3 bucket is private; access via time-limited presigned GET URLs |

### Upload Progress on the Frontend

```javascript
// React: track upload progress using XMLHttpRequest
const uploadFile = async (file, presignedUrl, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });
    xhr.addEventListener("load", resolve);
    xhr.addEventListener("error", reject);
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
};
```

---

## Q5: Recovering from Accidental Course Deletion

### Problem Statement
An admin accidentally deletes a course. We need mechanisms to detect, prevent, and recover from this situation.

### Solution 1 — Soft Delete (Primary Prevention)

Replace hard `DELETE` with a soft-delete flag. A deleted course is invisible to students but recoverable by a super-admin.

```python
# models.py
from django.utils import timezone

class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(deleted_at__isnull=True)

class Course(models.Model):
    title        = models.CharField(max_length=200)
    description  = models.TextField()
    thumbnail    = models.URLField(blank=True)
    category     = models.CharField(max_length=100, blank=True)
    created_by   = models.ForeignKey("User", on_delete=models.RESTRICT)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)
    deleted_at   = models.DateTimeField(null=True, blank=True, db_index=True)  # soft delete

    objects      = SoftDeleteManager()   # hides deleted records
    all_objects  = models.Manager()      # includes deleted records (for admin recovery)

    def soft_delete(self, user):
        """Mark the course as deleted and log the action."""
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at"])
        AuditLog.objects.create(
            action="COURSE_DELETED",
            performed_by=user,
            target_id=self.pk,
            metadata={"title": self.title},
        )

    def restore(self, user):
        """Undo a soft delete."""
        self.deleted_at = None
        self.save(update_fields=["deleted_at"])
        AuditLog.objects.create(
            action="COURSE_RESTORED",
            performed_by=user,
            target_id=self.pk,
            metadata={"title": self.title},
        )
```

**Migration:**

```sql
ALTER TABLE courses ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL;
CREATE INDEX idx_courses_deleted_at ON courses (deleted_at);
```

---

### Solution 2 — Audit Logging

Every destructive action is recorded in an immutable audit log:

```python
# models.py
class AuditLog(models.Model):
    action       = models.CharField(max_length=100)
    performed_by = models.ForeignKey("User", on_delete=models.SET_NULL, null=True)
    target_id    = models.BigIntegerField()
    metadata     = models.JSONField(default=dict)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["action", "target_id"])]
```

---

### Solution 3 — Admin Confirmation UX

Add a two-step confirmation dialog in the admin frontend:

```javascript
const handleDelete = async (courseId, courseTitle) => {
  const confirmed = await showConfirmDialog({
    title: "Delete Course?",
    message: `Are you sure you want to delete "${courseTitle}"?
              This action will hide the course from all students.
              It can be restored within 30 days.`,
    confirmLabel: "Delete",
    confirmColor: "danger",
  });

  if (!confirmed) return;

  // Require typing the course title to confirm
  const typed = await showTextConfirmDialog({
    message: `Type the course title to confirm deletion:`,
    expected: courseTitle,
  });

  if (typed !== courseTitle) {
    toast.error("Course title did not match. Deletion cancelled.");
    return;
  }

  await api.delete(`/courses/${courseId}/`);
  toast.success("Course deleted. It can be restored from the Admin panel.");
};
```

---

### Solution 4 — Automated MySQL Backups

**Daily automated backup via cron (on the server):**

```bash
#!/bin/bash
# /etc/cron.d/lms_backup — runs daily at 02:00
BACKUP_DIR="/var/backups/mini_lms"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="${BACKUP_DIR}/mini_lms_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

mysqldump \
  --host="${DB_HOST}" \
  --user="${DB_USER}" \
  --password="${DB_PASS}" \
  --single-transaction \
  --routines \
  --triggers \
  mini_lms | gzip > "${FILENAME}"

# Upload to S3 for off-site retention
aws s3 cp "${FILENAME}" "s3://lms-backups/daily/"

# Purge local backups older than 14 days
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +14 -delete

echo "Backup complete: ${FILENAME}"
```

**AWS RDS (production):** Enable automated backups with a 7-day retention window and enable **Point-In-Time Recovery (PITR)**. PITR lets you restore the database to any second within the retention window.

---

### Solution 5 — Point-In-Time Recovery

If a hard delete occurred before soft delete was in place:

```bash
# 1. Identify the last good timestamp from the audit log or binary logs
# 2. Restore RDS snapshot to a new instance
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier mini-lms-prod \
  --target-db-instance-identifier mini-lms-recovery \
  --restore-time 2026-06-04T10:30:00Z

# 3. Extract the deleted course data from the recovery instance
mysqldump mini_lms courses lessons assignments \
  --where="id=42" > recovered_course.sql

# 4. Import into production
mysql -h prod-host mini_lms < recovered_course.sql
```

---

### Recovery Capability Summary

| Mechanism | Prevents Deletion | Enables Recovery | Effort |
|---|---|---|---|
| Soft delete | ✅ (hides, not removes) | ✅ (instant restore) | Low |
| Admin confirmation dialog | ✅ (friction) | ❌ | Low |
| Audit logging | ❌ | ✅ (tracks what/when/who) | Low |
| MySQL automated backups | ❌ | ✅ (up to 14 days) | Low |
| RDS Point-in-Time Recovery | ❌ | ✅ (to the second) | Medium |

---

*End of Problem-Solving Answers*
