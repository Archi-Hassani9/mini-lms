-- =============================================================================
-- Mini LMS — Database Schema
-- Project   : AVGC XR Solutions Technical Assessment — Mini LMS
-- Author    : Database Architect
-- Created   : 2026-06-04
-- Engine    : MySQL 8.0+
-- Charset   : utf8mb4 / utf8mb4_unicode_ci
-- Version   : 1.0.0
--
-- Table creation order (respects FK dependencies):
--   1. roles
--   2. users
--   3. courses
--   4. lessons
--   5. enrollments
--   6. assignments
--   7. submissions
--   8. progress
--
-- All foreign keys use ON DELETE RESTRICT to prevent orphaned records.
-- All primary keys use BIGINT AUTO_INCREMENT.
-- Schema is in Third Normal Form (3NF).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Database
-- -----------------------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS mini_lms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mini_lms;

-- -----------------------------------------------------------------------------
-- 1. roles
--    Lookup table for user roles (e.g. Admin, Student).
--    Kept separate to allow future role additions without schema changes.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
  id         BIGINT       NOT NULL AUTO_INCREMENT,
  name       VARCHAR(50)  NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_name (name)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Lookup table for user roles';

-- -----------------------------------------------------------------------------
-- 2. users
--    Platform users.  Role is normalised into the roles table.
--    Email is unique across the entire platform.
--    password stores a Django PBKDF2 hash string.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id         BIGINT        NOT NULL AUTO_INCREMENT,
  role_id    BIGINT        NOT NULL,
  full_name  VARCHAR(100)  NOT NULL,
  email      VARCHAR(255)  NOT NULL,
  password   VARCHAR(255)  NOT NULL,
  is_active  BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),

  -- FK: every user must belong to a valid role
  CONSTRAINT fk_users_role_id
    FOREIGN KEY (role_id) REFERENCES roles (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  -- Frequently searched columns
  INDEX idx_users_email   (email),
  INDEX idx_users_role_id (role_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Platform users (admins and students)';

-- -----------------------------------------------------------------------------
-- 3. courses
--    Courses created by admin users.
--    created_by references the admin who owns the course.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id          BIGINT        NOT NULL AUTO_INCREMENT,
  title       VARCHAR(200)  NOT NULL,
  description TEXT          NOT NULL,
  thumbnail   VARCHAR(500)  NULL,
  category    VARCHAR(100)  NULL,
  created_by  BIGINT        NOT NULL,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
                                     ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- FK: course must be owned by an existing user (admin)
  CONSTRAINT fk_courses_created_by
    FOREIGN KEY (created_by) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  -- Search / filter indexes
  INDEX idx_courses_title      (title),
  INDEX idx_courses_category   (category),
  INDEX idx_courses_created_by (created_by)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Courses available on the platform';

-- -----------------------------------------------------------------------------
-- 4. lessons
--    Individual lessons belonging to a course.
--    order_no determines the display order within a course and must be >= 1.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lessons (
  id         BIGINT        NOT NULL AUTO_INCREMENT,
  course_id  BIGINT        NOT NULL,
  title      VARCHAR(200)  NOT NULL,
  content    LONGTEXT      NULL,
  video_url  VARCHAR(500)  NULL,
  order_no   INT           NOT NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- order_no must be a positive integer
  CONSTRAINT chk_lessons_order_no CHECK (order_no > 0),

  -- FK: lesson must belong to an existing course
  CONSTRAINT fk_lessons_course_id
    FOREIGN KEY (course_id) REFERENCES courses (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  INDEX idx_lessons_course_id (course_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Lessons within a course, ordered by order_no';

-- -----------------------------------------------------------------------------
-- 5. enrollments
--    Tracks which student is enrolled in which course.
--    The UNIQUE constraint on (student_id, course_id) prevents duplicates.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
  id          BIGINT    NOT NULL AUTO_INCREMENT,
  student_id  BIGINT    NOT NULL,
  course_id   BIGINT    NOT NULL,
  enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- Prevent a student from enrolling in the same course twice
  UNIQUE KEY uq_enrollments_student_course (student_id, course_id),

  -- FK: student must be an existing user
  CONSTRAINT fk_enrollments_student_id
    FOREIGN KEY (student_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  -- FK: course must exist
  CONSTRAINT fk_enrollments_course_id
    FOREIGN KEY (course_id) REFERENCES courses (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  INDEX idx_enrollments_student_id (student_id),
  INDEX idx_enrollments_course_id  (course_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Student-course enrollment records';

-- -----------------------------------------------------------------------------
-- 6. assignments
--    Assignments linked to a course, with a submission deadline.
--    max_marks must be a positive integer.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assignments (
  id          BIGINT        NOT NULL AUTO_INCREMENT,
  course_id   BIGINT        NOT NULL,
  title       VARCHAR(200)  NOT NULL,
  description TEXT          NOT NULL,
  deadline    DATETIME      NOT NULL,
  max_marks   INT           NOT NULL DEFAULT 100,
  created_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- max_marks must be positive
  CONSTRAINT chk_assignments_max_marks CHECK (max_marks > 0),

  -- FK: assignment must belong to an existing course
  CONSTRAINT fk_assignments_course_id
    FOREIGN KEY (course_id) REFERENCES courses (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  INDEX idx_assignments_course_id (course_id),
  INDEX idx_assignments_deadline  (deadline)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Assignments for each course';

-- -----------------------------------------------------------------------------
-- 7. submissions
--    Student submission for a given assignment.
--    UNIQUE on (assignment_id, student_id) — one submission per student
--    per assignment.  status tracks review workflow.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
  id            BIGINT        NOT NULL AUTO_INCREMENT,
  assignment_id BIGINT        NOT NULL,
  student_id    BIGINT        NOT NULL,
  file_url      VARCHAR(500)  NOT NULL,
  submitted_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status        ENUM('Submitted', 'Reviewed', 'Rejected')
                              NOT NULL DEFAULT 'Submitted',

  PRIMARY KEY (id),

  -- One submission per student per assignment
  UNIQUE KEY uq_submissions_assignment_student (assignment_id, student_id),

  -- FK: must reference an existing assignment
  CONSTRAINT fk_submissions_assignment_id
    FOREIGN KEY (assignment_id) REFERENCES assignments (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  -- FK: must reference an existing user (student)
  CONSTRAINT fk_submissions_student_id
    FOREIGN KEY (student_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  INDEX idx_submissions_assignment_id (assignment_id),
  INDEX idx_submissions_student_id    (student_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Student assignment submissions with review status';

-- -----------------------------------------------------------------------------
-- 8. progress
--    Tracks a student's completion percentage for each enrolled course.
--    UNIQUE on (student_id, course_id) — one progress record per enrollment.
--    percentage must be between 0.00 and 100.00 inclusive.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS progress (
  id           BIGINT         NOT NULL AUTO_INCREMENT,
  student_id   BIGINT         NOT NULL,
  course_id    BIGINT         NOT NULL,
  percentage   DECIMAL(5, 2)  NOT NULL DEFAULT 0.00,
  last_updated TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  -- One progress record per student-course pair
  UNIQUE KEY uq_progress_student_course (student_id, course_id),

  -- percentage must be in [0.00, 100.00]
  CONSTRAINT chk_progress_percentage
    CHECK (percentage BETWEEN 0.00 AND 100.00),

  -- FK: must reference an existing user (student)
  CONSTRAINT fk_progress_student_id
    FOREIGN KEY (student_id) REFERENCES users (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  -- FK: must reference an existing course
  CONSTRAINT fk_progress_course_id
    FOREIGN KEY (course_id) REFERENCES courses (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  INDEX idx_progress_student_id (student_id),
  INDEX idx_progress_course_id  (course_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Per-student per-course completion percentage';

-- =============================================================================
-- End of schema.sql
-- =============================================================================
