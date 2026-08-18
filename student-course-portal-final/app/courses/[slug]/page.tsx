import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourses, getRelatedCourses } from "@/lib/api";
import Button from "@/components/Button";
import RelatedCourses from "@/components/RelatedCourses";

// Course data now lives in the backend and can change at any time, so this
// page always fetches fresh instead of being statically generated at build time.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { data: courses } = await getCourses({ limit: 100 });
    const course = courses.find((c) => c.slug === slug);
    if (!course) return { title: "Course Not Found | StudentHub" };
    return { title: `${course.title} | StudentHub`, description: course.description };
  } catch {
    return { title: "Course | StudentHub" };
  }
}

export default async function CourseDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let courses;
  try {
    const res = await getCourses({ limit: 100 });
    courses = res.data;
  } catch {
    // API is unreachable — this is different from "course doesn't exist",
    // so show a helpful message instead of a 404.
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="text-sm font-black uppercase tracking-[.2em] text-rose-600">Connection error</p>
        <h1 className="mt-3 text-2xl font-black text-slate-950">Couldn&apos;t load this course</h1>
        <p className="mt-3 text-slate-500">Make sure the backend API server is running, then refresh the page.</p>
        <Link href="/courses" className="mt-6 inline-flex text-sm font-bold text-indigo-600 hover:text-indigo-700">← Back to courses</Link>
      </div>
    );
  }

  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();

  const related = getRelatedCourses(course, courses);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <Link href="/courses" className="text-sm font-bold text-slate-500 hover:text-indigo-600">← Back to courses</Link>
      <div className="mt-6 overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl">
        <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_340px] lg:p-12">
          <div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-indigo-500/20 px-3 py-1.5 text-xs font-bold text-indigo-200">{course.category}</span><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-300">{course.level}</span></div><h1 className="mt-6 text-4xl font-black tracking-[-.03em] sm:text-5xl">{course.title}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">{course.description}</p><div className="mt-8 flex flex-wrap gap-3"><Button href="/contact">Enroll interest →</Button><Link href="#curriculum" className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white hover:bg-white/10">View curriculum</Link></div></div>
          <div className="rounded-3xl border border-white/10 bg-white/[.06] p-6"><p className="text-xs font-black uppercase tracking-[.2em] text-slate-500">Course snapshot</p><div className="mt-6 space-y-5"><div><p className="text-xs text-slate-500">Duration</p><p className="mt-1 font-bold">{course.duration}</p></div><div><p className="text-xs text-slate-500">Instructor</p><p className="mt-1 font-bold">{course.instructor_name ?? "Unassigned"}</p></div><div><p className="text-xs text-slate-500">Rating</p><p className="mt-1 font-bold">★★★★★ <span className="text-slate-400">4.8</span></p></div></div></div>
        </div>
      </div>
      <div id="curriculum" className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9"><p className="text-xs font-black uppercase tracking-[.2em] text-indigo-600">Curriculum</p><h2 className="mt-2 text-2xl font-black text-slate-950">What you&apos;ll learn</h2><div className="mt-7 grid gap-3 sm:grid-cols-2">{course.topics.map((topic, i) => <div key={topic} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm font-semibold text-slate-700"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-black text-indigo-700">{String(i + 1).padStart(2, '0')}</span>{topic}</div>)}</div></section>
        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"><p className="text-xs font-black uppercase tracking-[.2em] text-slate-400">Your next step</p><h3 className="mt-3 text-xl font-black text-slate-950">Ready to start?</h3><p className="mt-2 text-sm leading-6 text-slate-500">Reach out and we&apos;ll help you choose the right learning path.</p><Button href="/contact" className="mt-6 w-full">Get started</Button></aside>
      </div>
      <RelatedCourses courses={related} />
    </div>
  );
}
