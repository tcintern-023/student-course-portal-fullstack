import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-sm font-black">SC</span><span className="text-lg font-black">Student<span className="text-indigo-300">Hub</span></span></div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">A modern student course portal built to make discovering practical skills simple, focused, and enjoyable.</p>
        </div>
        <div><p className="text-xs font-black uppercase tracking-[.2em] text-slate-500">Explore</p><ul className="mt-4 space-y-3 text-sm text-slate-300"><li><Link href="/courses" className="hover:text-white">Courses</Link></li><li><Link href="/instructors" className="hover:text-white">Instructors</Link></li><li><Link href="/contact" className="hover:text-white">Contact</Link></li></ul></div>
        <div><p className="text-xs font-black uppercase tracking-[.2em] text-slate-500">Contact</p><ul className="mt-4 space-y-3 text-sm text-slate-400"><li>hello@studenthub.dev</li><li>+92 300 1234567</li><li>Lahore, Pakistan</li></ul></div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} StudentHub. Built with Next.js &amp; Tailwind CSS.</div>
    </footer>
  );
}
