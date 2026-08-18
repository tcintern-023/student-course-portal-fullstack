-- Student Course Portal — PostgreSQL Schema
-- Run via: npm run migrate  (executes this file against DATABASE_URL)

-- ── Users (authentication) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT         NOT NULL,
  role          VARCHAR(20)  NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at    TIMESTAMP    NOT NULL DEFAULT now()
);

-- ── Instructors ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS instructors (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  bio        TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- ── Courses ──────────────────────────────────────────────────
-- instructor_id: many courses belong to one instructor (1-to-many).
-- ON DELETE SET NULL: deleting an instructor doesn't delete their courses.
CREATE TABLE IF NOT EXISTS courses (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(255) UNIQUE NOT NULL,
  title         VARCHAR(255) NOT NULL,
  category      VARCHAR(100) NOT NULL,
  level         VARCHAR(50)  NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  duration      VARCHAR(50)  NOT NULL,
  description   TEXT         NOT NULL,
  topics        TEXT[]       NOT NULL DEFAULT '{}',
  instructor_id INTEGER      REFERENCES instructors(id) ON DELETE SET NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);

-- ── Students ─────────────────────────────────────────────────
-- user_id links a student profile to the account that owns it, which is
-- what ownership-based authorization (see enrollmentController/studentController)
-- checks against. It's nullable because admins can create "roster" student
-- records that aren't tied to any login.
CREATE TABLE IF NOT EXISTS students (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  user_id    INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Idempotent for databases that already have a `students` table from before
-- this column existed — CREATE TABLE IF NOT EXISTS above is a no-op on those.
ALTER TABLE students ADD COLUMN IF NOT EXISTS user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL;

-- ── Enrollments (bonus) ──────────────────────────────────────
-- Many-to-many join table between students and courses.
-- ON DELETE CASCADE: deleting a student or course cleans up their enrollments.
CREATE TABLE IF NOT EXISTS enrollments (
  id           SERIAL PRIMARY KEY,
  student_id   INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id    INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at  TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
