import CourseCard from "@/components/CourseCard";
import SectionTitle from "@/components/SectionTitle";
import type { Course } from "@/lib/api";

export default function RelatedCourses({ courses }: { courses: Course[] }) {
  if (courses.length === 0) return null;

  return (
    <section className="mt-16 border-t border-slate-200 pt-10">
      <SectionTitle title="Related Courses" align="left" as="h2" />
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>
    </section>
  );
}
