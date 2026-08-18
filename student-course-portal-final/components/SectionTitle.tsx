interface SectionTitleProps { title: string; subtitle?: string; align?: "center" | "left"; as?: "h1" | "h2"; }

export default function SectionTitle({ title, subtitle, align = "center", as = "h1" }: SectionTitleProps) {
  const Heading = as;
  const alignment = align === "center" ? "text-center" : "text-left";
  return (
    <div className={alignment}>
      <p className="mb-3 text-xs font-black uppercase tracking-[.2em] text-indigo-600">StudentHub · Learning</p>
      <Heading className={as === "h1" ? "text-4xl font-black tracking-[-.03em] text-slate-950 sm:text-5xl" : "text-3xl font-black tracking-tight text-slate-950 sm:text-4xl"}>{title}</Heading>
      {subtitle && <p className={`mt-4 max-w-2xl text-base leading-7 text-slate-500 ${align === "center" ? "mx-auto" : ""}`}>{subtitle}</p>}
    </div>
  );
}
