import type { Metadata } from "next";
import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import { getInstructors, type Instructor } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Instructors | StudentHub", description: "Meet the instructors teaching practical courses." };

const ACCENTS = ["bg-indigo-500", "bg-violet-500", "bg-cyan-500", "bg-emerald-500"];

export default async function InstructorsPage() {
  let instructors: Instructor[] = [];
  let apiUnavailable = false;

  try {
    instructors = await getInstructors();
  } catch {
    apiUnavailable = true;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <SectionTitle title="Meet the people behind the lessons" subtitle="Learn from practitioners who turn real-world experience into clear, useful learning paths." />

      {apiUnavailable ? (
        <p className="mx-auto mt-12 max-w-2xl rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center text-sm font-semibold text-amber-800">
          Couldn&apos;t load instructors right now — make sure the backend API server is running.
        </p>
      ) : instructors.length === 0 ? (
        <p className="mt-12 text-center text-slate-500">
          No instructors yet. Add one from the{" "}
          <Link href="/courses" className="font-bold text-indigo-600 hover:text-indigo-700">Courses</Link> page.
        </p>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {instructors.map((instructor, i) => (
            <article key={instructor.id} className="card-lift group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className={`h-2 ${ACCENTS[i % ACCENTS.length]}`} />
              <div className="p-7 sm:p-8">
                <div className="flex gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white shadow-lg">
                    {instructor.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-black text-slate-950">{instructor.name}</h2>
                    <p className="mt-1 text-sm font-bold text-indigo-600">
                      {instructor.course_count} course{instructor.course_count === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                {instructor.bio && <p className="mt-6 text-sm leading-7 text-slate-500">{instructor.bio}</p>}
                {instructor.courses.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {instructor.courses.map((title) => (
                      <span key={title} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{title}</span>
                    ))}
                  </div>
                )}
                <Link href="/contact" className="mt-7 inline-flex text-sm font-black text-slate-800 group-hover:text-indigo-600">View instructor →</Link>
                <a
                  href={`mailto:${instructor.email}`}
                  className="ml-4 mt-7 inline-flex text-sm font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Email {instructor.name.split(" ")[0]}
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
