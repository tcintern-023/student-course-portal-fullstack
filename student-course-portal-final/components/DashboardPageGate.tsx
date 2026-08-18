"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import StudentDashboard from "@/components/StudentDashboard";

export default function DashboardPageGate() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return (
      <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="font-bold text-slate-700">Log in to see your dashboard.</p>
        <Link
          href="/login"
          className="mt-5 inline-flex rounded-full bg-slate-950 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600"
        >
          Log in →
        </Link>
      </div>
    );
  }

  if (user.role === "admin") {
    return (
      <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="font-bold text-slate-700">Admins manage students from the Students page.</p>
        <Link
          href="/students"
          className="mt-5 inline-flex rounded-full bg-slate-950 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600"
        >
          Go to Students →
        </Link>
      </div>
    );
  }

  return <StudentDashboard />;
}
