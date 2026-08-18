"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) { e.preventDefault(); setSubmitted(true); }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm lg:grid-cols-[.8fr_1.2fr]">
        <div className="bg-slate-950 p-8 text-white sm:p-10 lg:p-12">
          <p className="text-xs font-black uppercase tracking-[.2em] text-indigo-300">Let&apos;s talk</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Questions? We&apos;re listening.</h1>
          <p className="mt-5 leading-7 text-slate-400">Ask about a course, the learning paths, or anything else about StudentHub.</p>
          <div className="mt-10 space-y-5 text-sm"><div><p className="font-bold text-white">Email</p><p className="mt-1 text-slate-400">hello@studenthub.dev</p></div><div><p className="font-bold text-white">Phone</p><p className="mt-1 text-slate-400">+92 300 1234567</p></div><div><p className="font-bold text-white">Location</p><p className="mt-1 text-slate-400">Lahore, Pakistan</p></div></div>
        </div>
        <div className="p-7 sm:p-10 lg:p-12">
          {submitted ? <div className="rounded-3xl bg-emerald-50 p-8 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-xl text-white">✓</div><h2 className="mt-5 text-xl font-black text-emerald-900">Message received!</h2><p className="mt-2 text-sm leading-6 text-emerald-700">This demo form is ready for a backend/API integration.</p></div> : <form onSubmit={handleSubmit} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold text-slate-700">Name<input name="name" required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-indigo-500 focus:bg-white" placeholder="Your name" /></label><label className="text-sm font-bold text-slate-700">Email<input name="email" type="email" required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-indigo-500 focus:bg-white" placeholder="you@example.com" /></label></div><label className="block text-sm font-bold text-slate-700">Message<textarea name="message" rows={6} required className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal outline-none transition focus:border-indigo-500 focus:bg-white" placeholder="How can we help?" /></label><button type="submit" className="w-full rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-black text-white transition hover:bg-indigo-600">Send message →</button></form>}
        </div>
      </div>
    </div>
  );
}
