export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="animate-pulse">
        <div className="mx-auto h-10 max-w-sm rounded bg-slate-200" />
        <div className="mx-auto mt-4 h-5 max-w-xl rounded bg-slate-200" />
        <div className="mx-auto mt-8 h-11 max-w-xl rounded bg-slate-200" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="h-64 rounded-2xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
