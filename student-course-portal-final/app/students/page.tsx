import type { Metadata } from "next";
import SectionTitle from "@/components/SectionTitle";
import StudentsManager from "@/components/StudentsManager";

export const metadata: Metadata = { title: "Students | StudentHub", description: "Manage students and their course enrollments." };

export default function StudentsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <SectionTitle title="Students" subtitle="Add students, edit their details, and manage which courses they're enrolled in." />
        <StudentsManager />
      </div>
    </div>
  );
}
