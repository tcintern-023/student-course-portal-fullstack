"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/instructors", label: "Instructors" },
  { href: "/students", label: "Students" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-slate-950 text-sm font-black text-white shadow-lg shadow-indigo-200">
            <span className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 opacity-90" />
            <span className="relative">SC</span>
          </span>
          <span>
            <span className="block text-sm font-black tracking-tight text-slate-950">Student<span className="text-indigo-600">Hub</span></span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[.2em] text-slate-400 sm:block">Learning platform</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/70 p-1 shadow-sm md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-950 hover:text-white">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/contact" className="text-sm font-semibold text-slate-600 hover:text-indigo-600">Have a question?</Link>
          <Link href="/courses" className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-0.5 hover:bg-indigo-600">
            Start learning <span className="ml-1">→</span>
          </Link>
        </div>

        <button onClick={() => setOpen((v) => !v)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 shadow-sm md:hidden" aria-label="Toggle menu" aria-expanded={open}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 pt-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                {link.label}
              </Link>
            ))}
            <Link href="/courses" onClick={() => setOpen(false)} className="mt-2 rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-bold text-white">Start learning →</Link>
          </div>
        </div>
      )}
    </header>
  );
}
