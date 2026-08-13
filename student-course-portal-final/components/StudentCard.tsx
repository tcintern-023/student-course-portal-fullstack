"use client";

import { useState } from "react";
import Link from "next/link";
import type { Course, Enrollment, Student } from "@/lib/api";

interface StudentCardProps {
  student: Student;
  enrollments: Enrollment[];
  availableCourses: Course[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  onEnroll: (studentId: number, courseId: number) => Promise<void>;
  onUnenroll: (enrollment: Enrollment) => void;
  deleting: boolean;
  unenrollingId: number | null;
}

export default function StudentCard({
  student,
  enrollments,
  availableCourses,
  onEdit,
  onDelete,
  onEnroll,
  onUnenroll,
  deleting,
  unenrollingId,
}: StudentCardProps) {
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));
  const enrollableCourses = availableCourses.filter((c) => !enrolledCourseIds.has(c.id));

  const handleEnroll = async () => {
    if (!selectedCourseId) return;
    setEnrollError(null);
    setEnrolling(true);
    try {
      await onEnroll(student.id, Number(selectedCourseId));
      setSelectedCourseId("");
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : "Could not enroll. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <article className="card-lift flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black text-slate-950">{student.name}</h3>
          <p className="truncate text-sm text-slate-500">{student.email}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onEdit(student)}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(student)}
            disabled={deleting}
            className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Enrolled courses ({enrollments.length})
        </p>

        {enrollments.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">Not enrolled in anything yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {enrollments.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <Link href={`/courses/${e.course_slug}`} className="truncate text-sm font-semibold text-slate-700 hover:text-indigo-600">
                  {e.course_title}
                </Link>
                <button
                  type="button"
                  onClick={() => onUnenroll(e)}
                  disabled={unenrollingId === e.id}
                  className="shrink-0 text-xs font-bold text-rose-600 hover:text-rose-700 disabled:opacity-50"
                >
                  {unenrollingId === e.id ? "…" : "Unenroll"}
                </button>
              </li>
            ))}
          </ul>
        )}

        {enrollableCourses.length > 0 && (
          <div className="mt-4 flex gap-2">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Enroll in a course…</option>
              {enrollableCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleEnroll}
              disabled={!selectedCourseId || enrolling}
              className="shrink-0 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {enrolling ? "…" : "Enroll"}
            </button>
          </div>
        )}
        {enrollError && <p className="mt-2 text-xs font-semibold text-rose-600">{enrollError}</p>}
      </div>
    </article>
  );
}
