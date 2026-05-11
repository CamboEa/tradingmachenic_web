import { curriculum } from "@/lib/curriculum";

export const metadata = { title: "Program Management" };

export default function ProgramPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">
            Program Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage curriculum phases and modules.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          + Add Module
        </button>
      </div>

      <div className="space-y-10">
        {curriculum.map((phase) => {
          const isTheory = phase.phase === "theory";
          const accentText = isTheory ? "text-[#d4af37]" : "text-[#0ea5e9]";
          const accentBorder = isTheory
            ? "border-l-[#d4af37]"
            : "border-l-[#0ea5e9]";
          const badgeBg = isTheory
            ? "bg-amber-100 text-amber-700"
            : "bg-sky-100 text-sky-700";

          return (
            <section key={phase.phase}>
              {/* Phase header */}
              <div
                className={`mb-4 flex items-center justify-between rounded-xl border border-slate-200 border-l-4 bg-white px-5 py-4 shadow-sm ${accentBorder}`}
              >
                <div>
                  <p
                    className={`text-xs font-semibold uppercase tracking-widest ${accentText}`}
                  >
                    {isTheory ? "Phase I" : "Phase II"}
                  </p>
                  <h2 className="mt-0.5 text-base font-bold text-[#1e293b]">
                    {isTheory ? "Theory" : "Put It All Together"}
                  </h2>
                </div>
                <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
                  {phase.weeks.length} modules
                </span>
              </div>

              {/* Modules table */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="w-10 px-5 py-3">#</th>
                      <th className="px-5 py-3">Module Title (EN)</th>
                      <th className="px-5 py-3">Module Title (KM)</th>
                      <th className="px-5 py-3">Focus</th>
                      <th className="px-5 py-3">Activities</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {phase.weeks.map((week, i) => (
                      <tr
                        key={i}
                        className={
                          i < phase.weeks.length - 1
                            ? "border-b border-slate-100"
                            : ""
                        }
                      >
                        <td className="px-5 py-4">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${badgeBg}`}
                          >
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-semibold text-[#1e293b]">
                          {week.titles.en}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {week.titles.km}
                        </td>
                        <td className="max-w-xs px-5 py-4 text-xs leading-relaxed text-slate-500">
                          {week.focus.en}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
                            {week.activities.en.length} items
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-400 transition-colors hover:border-red-300 hover:text-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
