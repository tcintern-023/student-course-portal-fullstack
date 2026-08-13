"use client";

import { useEffect, useState } from "react";
import StudentCard from "@/components/StudentCard";
import StudentForm from "@/components/StudentForm";
import {
  getStudents,
  getCourses,
  getEnrollments,
  deleteStudent,
  createEnrollment,
  deleteEnrollment,
  ApiRequestError,
  type Student,
  type Course,
  type Enrollment,
} from "@/lib/api";

function StudentCardSkeleton() {
  return <div className="h-52 animate-pulse rounded-3xl border border-slate-200 bg-slate-100" />;
}

export default function StudentsManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [unenrollingId, setUnenrollingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadAll = () => {
    setLoading(true);
    setError(null);
    Promise.all([getStudents(), getCourses({ limit: 100 }), getEnrollments()])
      .then(([studentsRes, coursesRes, enrollmentsRes]) => {
        setStudents(studentsRes);
        setCourses(coursesRes.data);
        setEnrollments(enrollmentsRes);
      })
      .catch((err) => {
        setError(
          err instanceof ApiRequestError ? err.message : "Failed to load students. Please try again."
        );
      })
      .finally(() => setLoading(false));
  };

  // Mount-only fetch. All setState calls happen inside .then()/.catch()
  // callbacks, never synchronously in the effect body.
  useEffect(() => {
    let cancelled = false;

    Promise.all([getStudents(), getCourses({ limit: 100 }), getEnrollments()])
      .then(([studentsRes, coursesRes, enrollmentsRes]) => {
        if (cancelled) return;
        setStudents(studentsRes);
        setCourses(coursesRes.data);
        setEnrollments(enrollmentsRes);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiRequestError ? err.message : "Failed to load students. Please try again."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreated = (student: Student) => {
    setStudents((prev) => [...prev, student]);
    setShowAddForm(false);
  };

  const handleUpdated = (student: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === student.id ? student : s)));
    setEditingStudent(null);
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`Delete "${student.name}"? This also removes their enrollments.`)) return;

    setActionError(null);
    setDeletingId(student.id);
    try {
      await deleteStudent(student.id);
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      setEnrollments((prev) => prev.filter((e) => e.student_id !== student.id));
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError ? err.message : "Failed to delete the student. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleEnroll = async (studentId: number, courseId: number) => {
    const enrollment = await createEnrollment(studentId, courseId);
    setEnrollments((prev) => [...prev, enrollment]);
  };

  const handleUnenroll = async (enrollment: Enrollment) => {
    setActionError(null);
    setUnenrollingId(enrollment.id);
    try {
      await deleteEnrollment(enrollment.id);
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollment.id));
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError ? err.message : "Failed to unenroll. Please try again."
      );
    } finally {
      setUnenrollingId(null);
    }
  };

  return (
    <div>
      <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => {
            setShowAddForm((prev) => !prev);
            setEditingStudent(null);
          }}
          className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600"
        >
          {showAddForm ? "Close form" : "+ Add a student"}
        </button>
      </div>

      {showAddForm && (
        <div className="mx-auto mt-6 max-w-2xl">
          <StudentForm mode="create" onSuccess={handleCreated} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {editingStudent && (
        <div className="mx-auto mt-6 max-w-2xl">
          <StudentForm
            mode="edit"
            initialStudent={editingStudent}
            onSuccess={handleUpdated}
            onCancel={() => setEditingStudent(null)}
          />
        </div>
      )}

      {actionError && (
        <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-700">
          {actionError}
        </p>
      )}

      {loading && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <StudentCardSkeleton key={i} />)}
        </div>
      )}

      {!loading && error && (
        <div className="mt-10 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
          <p className="font-bold text-rose-700">{error}</p>
          <button
            type="button"
            onClick={loadAll}
            className="mt-4 rounded-full bg-rose-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-rose-700"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        students.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                enrollments={enrollments.filter((e) => e.student_id === student.id)}
                availableCourses={courses}
                onEdit={(s) => {
                  setEditingStudent(s);
                  setShowAddForm(false);
                }}
                onDelete={handleDelete}
                onEnroll={handleEnroll}
                onUnenroll={handleUnenroll}
                deleting={deletingId === student.id}
                unenrollingId={unenrollingId}
              />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-slate-500">No students yet. Add the first one above.</p>
        )
      )}
    </div>
  );
}
