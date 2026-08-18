import type { Metadata } from "next";
import SectionTitle from "@/components/SectionTitle";
import DashboardPageGate from "@/components/DashboardPageGate";

export const metadata: Metadata = { title: "Dashboard | StudentHub", description: "Your profile, your enrolled courses, and your instructors." };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <SectionTitle title="Your dashboard" subtitle="Manage your profile, enroll in courses, and reach out to instructors." />
        <DashboardPageGate />
      </div>
    </div>
  );
}
