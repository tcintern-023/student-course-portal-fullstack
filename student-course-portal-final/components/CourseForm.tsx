"use client";

import { useEffect, useState } from "react";
import {
  createCourse,
  updateCourse,
  createInstructor,
  getInstructors,
  ApiRequestError,
  type Course,
  type CourseInput,
  type Instructor,
} from "@/lib/api";

const LEVELS: Course["level"][] = ["Beginner", "Intermediate", "Advanced"];
const NEW_INSTRUCTOR_VALUE = "__new__";

interface CourseFormProps {
  mode: "create" | "edit";
  initialCourse?: Course;
  onSuccess: (course: Course) => void;
  onCancel: () => void;
}

const emptyForm = {
  title: "",
  category: "",
  level: "Beginner" as Course["level"],
  duration: "",
  description: "",
  topics: "",
};

export default function CourseForm({ mode, initialCourse, onSuccess, onCancel }: CourseFormProps) {
  const [form, setForm] = useState(
    initialCourse
      ? {
          title: initialCourse.title,
          category: initialCourse.category,
          level: initialCourse.level,
          duration: initialCourse.duration,
          description: initialCourse.description,
          topics: initialCourse.topics.join(", "),
        }
      : emptyForm
  );

  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [instructorsLoading, setInstructorsLoading] = useState(true);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>(
    initialCourse?.instructor_id ? String(initialCourse.instructor_id) : ""
  );
  const [newInstructorName, setNewInstructorName] = useState("");
  const [newInstructorEmail, setNewInstructorEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInstructors()
      .then(setInstructors)
      .catch(() => setInstructors([]))
      .finally(() => setInstructorsLoading(false));
  }, []);

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedInstructorId === NEW_INSTRUCTOR_VALUE) {
      if (!newInstructorName.trim() || !newInstructorEmail.trim()) {
        setError("Enter a name and email for the new instructor.");
        return;
      }
    }

    setSubmitting(true);

    try {
      // If "add a new instructor" was chosen, create them first — this is
      // what makes them show up on the Instructors page right away.
      let instructorId: number | null =
        selectedInstructorId && selectedInstructorId !== NEW_INSTRUCTOR_VALUE
          ? Number(selectedInstructorId)
          : null;

      if (selectedInstructorId === NEW_INSTRUCTOR_VALUE) {
        const created = await createInstructor({
          name: newInstructorName.trim(),
          email: newInstructorEmail.trim(),
        });
        instructorId = created.id;
      }

      const input: CourseInput = {
        title: form.title.trim(),
        category: form.category.trim(),
        level: form.level,
        duration: form.duration.trim(),
        description: form.description.trim(),
        topics: form.topics
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        instructorId,
      };

      const course =
        mode === "create"
          ? await createCourse(input)
          : await updateCourse(initialCourse!.id, input);
      onSuccess(course);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-7"
    >
      <h3 className="text-lg font-black text-slate-950">
        {mode === "create" ? "Add a new course" : `Edit "${initialCourse?.title}"`}
      </h3>

      {error && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Title</label>
          <input
            required
            value={form.title}
            onChange={handleChange("title")}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Backend Engineering"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Category</label>
          <input
            required
            value={form.category}
            onChange={handleChange("category")}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Web"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Level</label>
          <select
            value={form.level}
            onChange={handleChange("level")}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Duration</label>
          <input
            required
            value={form.duration}
            onChange={handleChange("duration")}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. 8 weeks"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Instructor</label>
          <select
            value={selectedInstructorId}
            onChange={(e) => setSelectedInstructorId(e.target.value)}
            disabled={instructorsLoading}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">
              {instructorsLoading ? "Loading instructors…" : "— No instructor —"}
            </option>
            {instructors.map((i) => (
              <option key={i.id} value={i.id}>{i.name}</option>
            ))}
            <option value={NEW_INSTRUCTOR_VALUE}>+ Add a new instructor…</option>
          </select>
        </div>

        {selectedInstructorId === NEW_INSTRUCTOR_VALUE && (
          <div className="sm:col-span-2 grid gap-4 rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">New instructor name</label>
              <input
                value={newInstructorName}
                onChange={(e) => setNewInstructorName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. Fatima Noor"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-slate-500">New instructor email</label>
              <input
                type="email"
                value={newInstructorEmail}
                onChange={(e) => setNewInstructorEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. fatima@example.com"
              />
            </div>
            <p className="sm:col-span-2 text-xs text-slate-500">
              This instructor will be created and will appear on the Instructors page.
            </p>
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Description</label>
          <textarea
            required
            rows={3}
            value={form.description}
            onChange={handleChange("description")}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="What will students learn?"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Topics <span className="font-normal normal-case text-slate-400">(comma-separated)</span>
          </label>
          <input
            required
            value={form.topics}
            onChange={handleChange("topics")}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. HTML & CSS, JavaScript, React"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Saving…" : mode === "create" ? "Add course" : "Save changes"}
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
