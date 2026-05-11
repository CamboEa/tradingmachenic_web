export const metadata = { title: "Students" };

export default function StudentsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Students</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage registered students and their progress.
          </p>
        </div>
      </div>

      {/* Coming soon */}
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-7 w-7 text-slate-400"
          >
            <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 17a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
          </svg>
        </div>
        <h2 className="mt-4 text-base font-semibold text-[#1e293b]">
          Student management coming soon
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
          Connect your authentication backend to see registered students, track
          progress, and manage access.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700">
          Requires auth backend
        </div>
      </div>
    </div>
  );
}
