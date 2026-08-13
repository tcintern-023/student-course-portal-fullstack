"use client";

import { useState } from "react";
import { createStudent, updateStudent, ApiRequestError, type Student, type StudentInput } from "@/lib/api";

interface StudentFormProps {
  mode: "create" | "edit";
  initialStudent?: Student;
  onSuccess: (student: Student) => void;
  onCancel: () => void;
}

export default function StudentForm({ mode, initialStudent, onSuccess, onCancel }: StudentFormProps) {
  const [name, setName] = useState(initialStudent?.name ?? "");
  const [email, setEmail] = useState(initialStudent?.email ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const input: StudentInput = { name: name.trim(), email: email.trim() };

    try {
      const student =
        mode === "create"
          ? await createStudent(input)
          : await updateStudent(initialStudent!.id, input);
      onSuccess(student);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
      <h3 className="text-lg font-black text-slate-950">
        {mode === "create" ? "Add a new student" : `Edit "${initialStudent?.name}"`}
      </h3>

      {error && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Ali Raza"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. ali.raza@example.com"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : mode === "create" ? "Add student" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-full border border-slate-300 px-6 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
