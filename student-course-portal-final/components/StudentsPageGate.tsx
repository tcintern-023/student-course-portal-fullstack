"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import StudentsManager from "@/components/StudentsManager";

/**
 * The full student roster is admin-only (see studentController.js /
 * studentRoutes.js on the backend — this is UI convenience, not the real
 * enforcement). Anyone else lands here on a message pointing them to the
 * page that's actually theirs.
 */
export default function StudentsPageGate() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user?.role === "admin") {
    return <StudentsManager />;
  }

  return (
    <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
      <p className="font-bold text-slate-700">This section is for administrators.</p>
      <p className="mt-2 text-sm text-slate-500">
        {user
          ? "Manage your own profile and enrollments from your dashboard instead."
          : "Log in to manage your profile and enrollments."}
      </p>
      <Link
        href={user ? "/dashboard" : "/login"}
        className="mt-5 inline-flex rounded-full bg-slate-950 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600"
      >
        {user ? "Go to your dashboard →" : "Log in →"}
      </Link>
    </div>
  );
}
