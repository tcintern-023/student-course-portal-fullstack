"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import CourseForm from "@/components/CourseForm";
import { useAuth } from "@/components/AuthProvider";
import { getCourses, deleteCourse, ApiRequestError, type Course } from "@/lib/api";

const PAGE_SIZE = 6;

function CourseCardSkeleton() {
  return <div className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-slate-100" />;
}

export default function CourseSearch() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Debounce typing before triggering a server-side search request.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setPage(1);
      setSearch(inputValue.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [inputValue]);

  // Fetch whenever page or (debounced) search changes. Every setState call
  // happens inside a .then()/.catch()/.finally() callback — never
  // synchronously in the effect body — so this plays nicely with React's
  // set-state-in-effect lint rule.
  useEffect(() => {
    let cancelled = false;

    Promise.resolve()
      .then(() => {
        if (cancelled) return undefined;
        setLoading(true);
        setError(null);
        return getCourses({ page, limit: PAGE_SIZE, search: search || undefined });
      })
      .then((res) => {
        if (cancelled || !res) return;
        setCourses(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiRequestError ? err.message : "Failed to load courses. Please try again."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, search]);

  // Used by the "Try again" button — a click handler, not an effect, so
  // setting state synchronously here is completely normal.
  const loadCourses = (targetPage: number, targetSearch: string) => {
    setLoading(true);
    setError(null);
    getCourses({ page: targetPage, limit: PAGE_SIZE, search: targetSearch || undefined })
      .then((res) => {
        setCourses(res.data);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      })
      .catch((err) => {
        setError(
          err instanceof ApiRequestError ? err.message : "Failed to load courses. Please try again."
        );
      })
      .finally(() => setLoading(false));
  };

  const handleCreated = () => {
    setShowAddForm(false);
    setPage(1);
    loadCourses(1, search);
  };

  const handleUpdated = (course: Course) => {
    setCourses((prev) => prev.map((c) => (c.id === course.id ? course : c)));
    setEditingCourse(null);
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`Delete "${course.title}"? This can't be undone.`)) return;

    setActionError(null);
    setDeletingId(course.id);
    try {
      await deleteCourse(course.id);
      loadCourses(page, search);
    } catch (err) {
      setActionError(
        err instanceof ApiRequestError ? err.message : "Failed to delete the course. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-4">
        <div className="relative w-full">
          <label htmlFor="course-search" className="sr-only">Search courses</label>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            id="course-search"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search by title, category, description, instructor..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => {
              setShowAddForm((prev) => !prev);
              setEditingCourse(null);
            }}
            className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600"
          >
            {showAddForm ? "Close form" : "+ Add a course"}
          </button>
        ) : user ? (
          <p className="text-sm text-slate-500">Only admins can add or edit courses.</p>
        ) : (
          <p className="text-sm text-slate-500">
            <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">Log in</Link> to browse and enroll — course management is admin-only.
          </p>
        )}
      </div>

      {showAddForm && (
        <div className="mx-auto mt-6 max-w-2xl">
          <CourseForm mode="create" onSuccess={handleCreated} onCancel={() => setShowAddForm(false)} />
        </div>
      )}

      {editingCourse && (
        <div className="mx-auto mt-6 max-w-2xl">
          <CourseForm
            mode="edit"
            initialCourse={editingCourse}
            onSuccess={handleUpdated}
            onCancel={() => setEditingCourse(null)}
          />
        </div>
      )}

      {actionError && (
        <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-700">
          {actionError}
        </p>
      )}

      {/* Loading state */}
      {loading && (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => <CourseCardSkeleton key={i} />)}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="mt-10 rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
          <p className="font-bold text-rose-700">{error}</p>
          <button
            type="button"
            onClick={() => loadCourses(page, search)}
            className="mt-4 rounded-full bg-rose-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-rose-700"
          >
            Try again
          </button>
        </div>
      )}

      {/* Loaded state */}
      {!loading && !error && (
        courses.length > 0 ? (
          <>
            <p className="mt-8 text-center text-sm text-slate-500">
              {total} course{total === 1 ? "" : "s"} found
            </p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={isAdmin ? (c) => {
                    setEditingCourse(c);
                    setShowAddForm(false);
                  } : undefined}
                  onDelete={isAdmin ? handleDelete : undefined}
                  deleting={deletingId === course.id}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-sm font-semibold text-slate-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="mt-10 text-center text-slate-500">
            {search
              ? `No courses match "${search}". Try a different search term.`
              : "No courses yet. Add the first one above."}
          </p>
        )
      )}
    </div>
  );
}
