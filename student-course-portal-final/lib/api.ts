/**
 * API Client
 * ---------------
 * Every call from the Next.js app to the Express backend goes through
 * these functions. Keeping fetch logic here (instead of scattered across
 * components) means there's one place to change the base URL, one place
 * that shapes errors consistently, and one place components can trust.
 */

import { getToken } from "./tokenStorage";

export interface Course {
  id: number;
  slug: string;
  title: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  description: string;
  topics: string[];
  instructor_id: number | null;
  instructor_name: string | null;
  created_at: string;
}

export interface CourseInput {
  title: string;
  category: string;
  level: Course["level"];
  duration: string;
  description: string;
  topics: string[];
  instructorId: number | null;
}

export interface Instructor {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  created_at: string;
  course_count: number;
  courses: string[];
}

export interface InstructorInput {
  name: string;
  email: string;
  bio?: string;
}

export interface PaginatedCourses {
  data: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CourseQuery {
  search?: string;
  category?: string;
  level?: Course["level"];
  page?: number;
  limit?: number;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface StudentInput {
  name: string;
  email: string;
}

export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  enrolled_at: string;
  student_name: string;
  student_email: string;
  course_title: string;
  course_slug: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/**
 * Thrown for any failed request — both network failures (backend down)
 * and API-reported errors (validation, not found, etc). `status` is 0
 * for network failures so callers can tell the two apart if needed.
 */
export class ApiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

interface ApiEnvelope {
  success: boolean;
  data?: unknown;
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

async function request(path: string, options: RequestInit = {}): Promise<ApiEnvelope> {
  let response: Response;

  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiRequestError(
      0,
      "Could not reach the course API. Make sure the backend server is running."
    );
  }

  let body: ApiEnvelope | null = null;
  try {
    body = await response.json();
  } catch {
    // Response had no JSON body (e.g. some network-layer failures).
  }

  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      body?.error ?? `Request failed with status ${response.status}`
    );
  }

  return body ?? { success: true };
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// ── Courses ──────────────────────────────────────────────────

/** GET /api/courses — supports search, category/level filters, and pagination. */
export async function getCourses(query: CourseQuery = {}): Promise<PaginatedCourses> {
  const qs = buildQuery({
    search: query.search,
    category: query.category,
    level: query.level,
    page: query.page,
    limit: query.limit,
  });
  const res = await request(`/courses${qs}`, { cache: "no-store" });
  return {
    data: (res.data as Course[]) ?? [],
    total: res.total ?? 0,
    page: res.page ?? 1,
    limit: res.limit ?? 20,
    totalPages: res.totalPages ?? 1,
  };
}

/** GET /api/courses/:id */
export async function getCourseById(id: number): Promise<Course> {
  const res = await request(`/courses/${id}`, { cache: "no-store" });
  return res.data as Course;
}

/** POST /api/courses */
export async function createCourse(input: CourseInput): Promise<Course> {
  const res = await request("/courses", { method: "POST", body: JSON.stringify(input) });
  return res.data as Course;
}

/** PUT /api/courses/:id */
export async function updateCourse(id: number, input: Partial<CourseInput>): Promise<Course> {
  const res = await request(`/courses/${id}`, { method: "PUT", body: JSON.stringify(input) });
  return res.data as Course;
}

/** DELETE /api/courses/:id */
export async function deleteCourse(id: number): Promise<void> {
  await request(`/courses/${id}`, { method: "DELETE" });
}

// ── Instructors ──────────────────────────────────────────────

/** GET /api/instructors */
export async function getInstructors(): Promise<Instructor[]> {
  const res = await request("/instructors", { cache: "no-store" });
  return (res.data as Instructor[]) ?? [];
}

/** POST /api/instructors — used when a course is created with a brand-new instructor name. */
export async function createInstructor(input: InstructorInput): Promise<Instructor> {
  const res = await request("/instructors", { method: "POST", body: JSON.stringify(input) });
  return res.data as Instructor;
}

// ── Students ─────────────────────────────────────────────────

/** GET /api/students */
export async function getStudents(): Promise<Student[]> {
  const res = await request("/students", { cache: "no-store" });
  return (res.data as Student[]) ?? [];
}

/**
 * GET /api/students/me — the student profile linked to the logged-in user,
 * or null if they don't have one (e.g. an admin, or not logged in). Used to
 * work out which student card is "mine" so the UI can show edit/enroll
 * actions only for the profile a non-admin user actually owns.
 */
export async function getMyStudentProfile(): Promise<Student | null> {
  const res = await request("/students/me", { cache: "no-store" });
  return (res.data as Student | null) ?? null;
}

/** POST /api/students */
export async function createStudent(input: StudentInput): Promise<Student> {
  const res = await request("/students", { method: "POST", body: JSON.stringify(input) });
  return res.data as Student;
}

/** PUT /api/students/:id */
export async function updateStudent(id: number, input: Partial<StudentInput>): Promise<Student> {
  const res = await request(`/students/${id}`, { method: "PUT", body: JSON.stringify(input) });
  return res.data as Student;
}

/** DELETE /api/students/:id */
export async function deleteStudent(id: number): Promise<void> {
  await request(`/students/${id}`, { method: "DELETE" });
}

// ── Enrollments (bonus) ──────────────────────────────────────

/** GET /api/enrollments — optionally filter by studentId or courseId */
export async function getEnrollments(query: { studentId?: number; courseId?: number } = {}): Promise<Enrollment[]> {
  const qs = buildQuery({ studentId: query.studentId, courseId: query.courseId });
  const res = await request(`/enrollments${qs}`, { cache: "no-store" });
  return (res.data as Enrollment[]) ?? [];
}

/** POST /api/enrollments */
export async function createEnrollment(studentId: number, courseId: number): Promise<Enrollment> {
  const res = await request("/enrollments", {
    method: "POST",
    body: JSON.stringify({ studentId, courseId }),
  });
  return res.data as Enrollment;
}

/** DELETE /api/enrollments/:id */
export async function deleteEnrollment(id: number): Promise<void> {
  await request(`/enrollments/${id}`, { method: "DELETE" });
}

// ── Auth ─────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "admin";
  created_at: string;
}

/** POST /api/auth/register */
export async function registerUser(input: { name: string; email: string; password: string }): Promise<{ user: User; token: string }> {
  const res = await request("/auth/register", { method: "POST", body: JSON.stringify(input) });
  return res.data as { user: User; token: string };
}

/** POST /api/auth/login */
export async function loginUser(input: { email: string; password: string }): Promise<{ user: User; token: string }> {
  const res = await request("/auth/login", { method: "POST", body: JSON.stringify(input) });
  return res.data as { user: User; token: string };
}

/** GET /api/auth/me — validates the stored token and returns the current user. */
export async function getCurrentUser(): Promise<User> {
  const res = await request("/auth/me", { cache: "no-store" });
  return res.data as User;
}

// ── Helpers ──────────────────────────────────────────────────

/**
 * Returns other courses that share the same category (falling back to
 * "any other course" if none share a category), capped at `limit`.
 * Pure helper — operates on an already-fetched list, no network call.
 */
export function getRelatedCourses(course: Course, allCourses: Course[], limit = 3): Course[] {
  const sameCategory = allCourses.filter(
    (c) => c.id !== course.id && c.category === course.category
  );

  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  const others = allCourses.filter(
    (c) => c.id !== course.id && c.category !== course.category
  );

  return [...sameCategory, ...others].slice(0, limit);
}
