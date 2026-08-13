import Button from "@/components/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-semibold text-indigo-600">404</p>
      <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 text-slate-500">
        Sorry, we couldn&apos;t find the page or course you&apos;re looking for. It may
        have been moved or doesn&apos;t exist.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button href="/">Go Home</Button>
        <Button href="/courses" variant="secondary">
          Browse Courses
        </Button>
      </div>
    </div>
  );
}
