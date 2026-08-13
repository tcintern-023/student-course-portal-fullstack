import Link from "next/link";
import type { Course } from "@/lib/api";

const categoryIcons: Record<string, string> = {
  Web: "</>",
  "Artificial Intelligence": "AI",
  Data: "01",
  Mobile: "M",
  Design: "✦",
  Cloud: "☁",
};

interface CourseCardProps {
  course: Course;
  /** When provided, shows an Edit button (used on the manage/courses page). */
  onEdit?: (course: Course) => void;
  /** When provided, shows a Delete button (used on the manage/courses page). */
  onDelete?: (course: Course) => void;
  /** True while a delete request for this specific course is in flight. */
  deleting?: boolean;
}

export default function CourseCard({ course, onEdit, onDelete, deleting }: CourseCardProps) {
  const showManageActions = Boolean(onEdit || onDelete);

  return (
    <article className="card-lift group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative overflow-hidden bg-slate-950 p-5 text-white">
        <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-indigo-500/30 blur-2xl transition group-hover:bg-cyan-400/30" />
        <div className="relative flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-black ring-1 ring-white/15">{categoryIcons[course.category] ?? "SC"}</div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200">{course.level}</span>
        </div>
        <p className="relative mt-7 text-xs font-bold uppercase tracking-[.18em] text-indigo-300">{course.category}</p>
        <h3 className="relative mt-1 text-xl font-black tracking-tight">{course.title}</h3>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="line-clamp-3 text-sm leading-6 text-slate-500">{course.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {course.topics.slice(0, 3).map((topic) => <span key={topic} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{topic}</span>)}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
          <div className="text-xs text-slate-500"><span className="font-semibold text-slate-800">{course.duration}</span><span className="mx-2 text-slate-300">•</span>{course.instructor_name ?? "Unassigned"}</div>
          <Link href={`/courses/${course.slug}`} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-bold text-white transition group-hover:bg-indigo-600">Explore →</Link>
        </div>

        {showManageActions && (
          <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(course)}
                className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-600"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(course)}
                disabled={deleting}
                className="flex-1 rounded-full border border-rose-200 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
