"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentForm from "@/components/StudentForm";
import {
  getMyStudentProfile,
  getEnrollments,
  getCourses,
  getInstructors,
  createEnrollment,
  deleteEnrollment,
  ApiRequestError,
  type Student,
  type Course,
  type Enrollment,
  type Instructor,
} from "@/lib/api";

/**
 * Self-service view for a logged-in student: their own profile, their own
 * enrollments, a way to enroll in a new course, and a way to email the
 * instructor of each course they're taking. Every write here targets the
 * student's own id — the backend's ownership check (attachOwnStudent) is
 * what actually stops it from being used against anyone else's data, this
 * is just the matching UI.
 */
export default function StudentDashboard() {
  const [profile, setProfile] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [unenrollingId, setUnenrollingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getMyStudentProfile(), getEnrollments(), getCourses({ limit: 100 }), getInstructors()])
      .then(([profileRes, enrollmentsRes, coursesRes, instructorsRes]) => {
        if (cancelled) return;
        setProfile(profileRes);
        setEnrollments(enrollmentsRes);
        setCourses(coursesRes.data);
        setInstructors(instructorsRes);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiRequestError ? err.message : "Failed to load your dashboard. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const courseById = new Map(courses.map((c) => [c.id, c]));
  const instructorById = new Map(instructors.map((i) => [i.id, i]));
  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));
  const enrollableCourses = courses.filter((c) => !enrolledCourseIds.has(c.id));

  const handleEnroll = async () => {
    if (!profile || !selectedCourseId) return;
    setActionError(null);
    setEnrolling(true);
    try {
      const enrollment = await createEnrollment(profile.id, Number(selectedCourseId));
      setEnrollments((prev) => [...prev, enrollment]);
      setSelectedCourseId("");
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Could not enroll. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async (enrollment: Enrollment) => {
    setActionError(null);
    setUnenrollingId(enrollment.id);
    try {
      await deleteEnrollment(enrollment.id);
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollment.id));
    } catch (err) {
      setActionError(err instanceof ApiRequestError ? err.message : "Could not unenroll. Please try again.");
    } finally {
      setUnenrollingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-8 space-y-6">
        <div className="h-32 animate-pulse rounded-3xl border border-slate-200 bg-slate-100" />
        <div className="h-52 animate-pulse rounded-3xl border border-slate-200 bg-slate-100" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
        <p className="font-bold text-rose-700">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="font-bold text-amber-800">No student profile is linked to your account yet.</p>
        <p className="mt-2 text-sm text-amber-700">Ask an admin to link one so you can enroll in courses.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Profile */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
        {editingProfile ? (
          <StudentForm
            mode="edit"
            initialStudent={profile}
            onSuccess={(updated) => {
              setProfile(updated);
              setEditingProfile(false);
            }}
            onCancel={() => setEditingProfile(false)}
          />
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Your profile</p>
              <h3 className="mt-1 text-lg font-black text-slate-950">{profile.name}</h3>
              <p className="text-sm text-slate-500">{profile.email}</p>
            </div>
            <button
              type="button"
              onClick={() => setEditingProfile(true)}
              className="shrink-0 rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
            >
              Edit profile
            </button>
          </div>
        )}
      </section>

      {actionError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-700">
          {actionError}
        </p>
      )}

      {/* Enroll in a new course */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Enroll in a course</p>
        {enrollableCourses.length > 0 ? (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Choose a course…</option>
              {enrollableCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleEnroll}
              disabled={!selectedCourseId || enrolling}
              className="shrink-0 rounded-full bg-slate-950 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enrolling ? "Enrolling…" : "Enroll"}
            </button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-500">You're enrolled in every course in the catalog.</p>
        )}
      </section>

      {/* My enrolled courses */}
      <section>
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Your courses ({enrollments.length})
        </p>

        {enrollments.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Not enrolled in anything yet — pick a course above.</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {enrollments.map((e) => {
              const course = courseById.get(e.course_id);
              const instructor = course?.instructor_id ? instructorById.get(course.instructor_id) : undefined;
              return (
                <div key={e.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <Link href={`/courses/${e.course_slug}`} className="font-bold text-slate-900 hover:text-indigo-600">
                    {e.course_title}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">
                    Instructor: {instructor?.name ?? "Unassigned"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {instructor && (
                      <a
                        href={`mailto:${instructor.email}?subject=${encodeURIComponent(`Question about ${e.course_title}`)}`}
                        className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
                      >
                        Contact instructor
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleUnenroll(e)}
                      disabled={unenrollingId === e.id}
                      className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {unenrollingId === e.id ? "…" : "Unenroll"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
