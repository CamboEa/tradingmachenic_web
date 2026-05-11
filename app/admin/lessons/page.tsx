import { lessons } from "@/lib/course";

export const metadata = { title: "Lessons" };

export default function LessonsPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Lessons</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your video lesson library.
          </p>
        </div>
        <button
          type="button"
          className="rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          + Add Lesson
        </button>
      </div>

      <div className="space-y-5">
        {lessons.map((lesson, idx) => (
          <div
            key={lesson.slug}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Lesson header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                  {idx + 1}
                </span>
                <div>
                  <p className="font-semibold text-[#1e293b]">
                    {lesson.titles.en}
                  </p>
                  <p className="text-xs text-slate-400">{lesson.titles.km}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  ~{lesson.approximateMinutes} min
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {lesson.videos.length}{" "}
                  {lesson.videos.length === 1 ? "video" : "videos"}
                </span>
                <div className="flex gap-2">
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
              </div>
            </div>

            {/* Lesson meta */}
            <div className="grid grid-cols-3 gap-4 px-5 py-3 text-xs">
              <div>
                <p className="font-medium text-slate-500">Slug</p>
                <p className="mt-0.5 font-mono text-slate-700">{lesson.slug}</p>
              </div>
              <div>
                <p className="font-medium text-slate-500">Summary (EN)</p>
                <p className="mt-0.5 line-clamp-2 text-slate-700">
                  {lesson.summaries.en}
                </p>
              </div>
              <div>
                <p className="font-medium text-slate-500">Objectives</p>
                <p className="mt-0.5 text-slate-700">
                  {lesson.objectives.en.length} items
                </p>
              </div>
            </div>

            {/* Videos */}
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Videos
              </p>
              <div className="space-y-1.5">
                {lesson.videos.map((v, vi) => (
                  <div
                    key={vi}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                        {vi + 1}
                      </span>
                      <span className="text-xs font-medium text-slate-700">
                        {v.titles?.en ?? `Video ${vi + 1}`}
                      </span>
                    </div>
                    <span className="max-w-xs truncate font-mono text-[10px] text-slate-400">
                      {v.embedUrl}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
