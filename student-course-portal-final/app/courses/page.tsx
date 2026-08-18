import type { Metadata } from "next";
import SectionTitle from "@/components/SectionTitle";
import CourseSearch from "@/components/CourseSearch";

export const metadata: Metadata = { title: "Courses | StudentHub", description: "Browse practical courses across technology, AI, data, design, mobile, and cloud." };

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <SectionTitle title="Find your next skill" subtitle="Search, add, edit, or remove courses in the catalog." />
        <CourseSearch />
      </div>
    </div>
  );
}
