import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import { getCourses, getInstructors, type Course, type Instructor } from "@/lib/api";

const benefits = [
  ["01", "Learn by building", "Practical topics, focused roadmaps, and projects you can actually show."],
  ["02", "Guidance that matters", "Learn from instructors with real-world experience and clear teaching."],
  ["03", "Move at your pace", "Explore the catalog, save what interests you, and keep learning on your schedule."],
];

export default async function Home() {
  let featured: Course[] = [];
  let totalCourses = 0;
  let instructors: Instructor[] = [];
  let apiUnavailable = false;

  try {
    const [coursesRes, instructorsRes] = await Promise.all([
      getCourses({ limit: 3 }),
      getInstructors(),
    ]);
    featured = coursesRes.data;
    totalCourses = coursesRes.total;
    instructors = instructorsRes;
  } catch {
    apiUnavailable = true;
  }

  return (
    <div className="overflow-hidden">
      <section className="relative grid-pattern border-b border-slate-200/70">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl pulse-glow" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl pulse-glow" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Built for curious students
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[.98] tracking-[-.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              Build skills that <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 bg-clip-text text-transparent">move you forward.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              StudentHub is a focused course portal for discovering practical technology, design, data, and AI skills without the clutter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses" className="rounded-full bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-300 transition hover:-translate-y-1 hover:bg-indigo-600">Explore courses →</Link>
              <Link href="/instructors" className="rounded-full border border-slate-300 bg-white/80 px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:-translate-y-1 hover:border-indigo-300 hover:text-indigo-600">Meet the instructors</Link>
            </div>
            <div className="mt-9 flex items-center gap-6 text-sm text-slate-500">
              <div><strong className="text-slate-900">{totalCourses}+</strong> courses</div>
              <div className="h-5 w-px bg-slate-300" />
              <div><strong className="text-slate-900">4.8/5</strong> average rating</div>
              <div className="h-5 w-px bg-slate-300" />
              <div><strong className="text-slate-900">1.2k+</strong> learners</div>
            </div>
          </div>

          <div className="relative flex items-center justify-center lg:min-h-[520px]">
            <div className="absolute h-80 w-80 rounded-full bg-indigo-500/10 blur-2xl" />
            <div className="relative w-full max-w-md rounded-[2rem] border border-white/80 bg-slate-950 p-5 text-white shadow-2xl shadow-indigo-200 float-slow">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[.06] p-5">
                <div className="flex items-center justify-between">
                  <div><p className="text-xs font-bold uppercase tracking-[.2em] text-indigo-300">Your learning space</p><p className="mt-1 text-xl font-black">Keep moving forward.</p></div>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">On track</span>
                </div>
                <div className="mt-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5 shadow-xl">
                  <div className="flex items-center justify-between text-xs text-indigo-100"><span>Continue learning</span><span>72%</span></div>
                  <div className="mt-3 h-2 rounded-full bg-white/20"><div className="h-2 w-[72%] rounded-full bg-white" /></div>
                  <p className="mt-5 text-2xl font-black">Web Development</p>
                  <p className="mt-1 text-sm text-indigo-100">React · Next.js · Tailwind CSS</p>
                  <Link href="/courses/web-development" className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-xs font-black text-indigo-700">Continue course →</Link>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[['06','Courses'],['34','Hours'],['02','Completed']].map(([n,l]) => <div key={l} className="rounded-2xl bg-white/[.06] p-4"><p className="text-xl font-black">{n}</p><p className="mt-1 text-[11px] text-slate-400">{l}</p></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          {benefits.map(([number, title, text]) => (
            <div key={number} className="card-lift rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <span className="text-xs font-black tracking-[.2em] text-indigo-500">{number}</span>
              <h2 className="mt-5 text-xl font-black text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-indigo-600">Curated for you</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Featured courses</h2><p className="mt-2 max-w-xl text-slate-500">Start with a focused path and build something real.</p></div>
          <Link href="/courses" className="text-sm font-bold text-slate-700 hover:text-indigo-600">View full catalog →</Link>
        </div>
        {apiUnavailable ? (
          <p className="mt-9 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm font-semibold text-amber-800">
            Couldn&apos;t load courses right now — make sure the backend API server is running.
          </p>
        ) : (
          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featured.map((course) => <CourseCard key={course.slug} course={course} />)}</div>
        )}
      </section>

      <section className="border-y border-slate-200/70 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8 lg:py-20">
          <div><p className="text-xs font-black uppercase tracking-[.2em] text-indigo-300">Built around people</p><h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Learn from instructors who know the work, not just the theory.</h2><p className="mt-4 max-w-2xl leading-7 text-slate-400">Explore practical courses led by a small group of instructors across development, AI, data, mobile, design, and cloud.</p></div>
          <div className="flex items-center gap-3">
            {instructors.map((instructor, i) => <div key={instructor.id} title={instructor.name} className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 text-sm font-black text-white ${['bg-indigo-500','bg-violet-500','bg-cyan-500','bg-emerald-500'][i % 4]}`}>{instructor.name.split(' ').map(n=>n[0]).join('')}</div>)}
          </div>
        </div>
      </section>
    </div>
  );
}
