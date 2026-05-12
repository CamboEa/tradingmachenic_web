import Link from "next/link";

import { curriculum } from "@/lib/curriculum";
import { getAllLessons } from "@/lib/supabase/lessons";

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: "gold" | "teal" | "slate";
}) {
  const ring =
    accent === "gold"
      ? "border-l-[#d4af37]"
      : accent === "teal"
        ? "border-l-[#0ea5e9]"
        : "border-l-slate-400";

  return (
    <div
      className={`rounded-xl border border-slate-200 border-l-4 bg-white p-5 shadow-sm ${ring}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-[#1e293b]">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default async function AdminDashboard() {
  const lessons = await getAllLessons();
  const theoryModules =
    curriculum.find((p) => p.phase === "theory")?.weeks.length ?? 0;
  const practiceModules =
    curriculum.find((p) => p.phase === "practice")?.weeks.length ?? 0;
  const totalVideos = lessons.reduce((acc, l) => acc + l.videos.length, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1e293b]">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your Trading Machenic content.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Video Lessons"
          value={lessons.length}
          sub={`${totalVideos} total videos`}
          accent="teal"
        />
        <StatCard
          label="Theory Modules"
          value={theoryModules}
          sub="Phase I curriculum"
          accent="gold"
        />
        <StatCard
          label="Practice Modules"
          value={practiceModules}
          sub="Phase II curriculum"
          accent="gold"
        />
        <StatCard
          label="Tools Published"
          value={0}
          sub="Indicators & EAs"
          accent="slate"
        />
      </div>

      {/* Quick actions */}
      <div className="mt-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {[
            { href: "/admin/program", label: "Manage Program", color: "bg-[#d4af37] text-[#1e293b]" },
            { href: "/admin/lessons", label: "Manage Lessons", color: "bg-[#0ea5e9] text-white" },
            { href: "/admin/tools", label: "Create Tool", color: "bg-[#1e293b] text-white" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90 ${a.color}`}
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Lessons table */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Video Lessons
          </h2>
          <Link
            href="/admin/lessons"
            className="text-xs font-medium text-[#0ea5e9] hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Videos</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson, i) => (
                <tr
                  key={lesson.slug}
                  className={i < lessons.length - 1 ? "border-b border-slate-100" : ""}
                >
                  <td className="px-5 py-3 font-medium text-[#1e293b]">
                    {lesson.titles.en}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {lesson.videos.length}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    ~{lesson.approximateMinutes} min
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-400">
                    {lesson.slug}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/lessons`}
                      className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-[#0ea5e9] hover:text-[#0ea5e9] transition-colors"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Curriculum overview */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Curriculum Phases
          </h2>
          <Link
            href="/admin/program"
            className="text-xs font-medium text-[#0ea5e9] hover:underline"
          >
            Manage →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {curriculum.map((phase) => (
            <div
              key={phase.phase}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    phase.phase === "theory"
                      ? "text-[#d4af37]"
                      : "text-[#0ea5e9]"
                  }`}
                >
                  {phase.phase === "theory" ? "Phase I — Theory" : "Phase II — Practice"}
                </p>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {phase.weeks.length} modules
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {phase.weeks.map((week, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        phase.phase === "theory"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-sky-100 text-sky-700"
                      }`}
                    >
                      {i + 1}
                    </span>
                    {week.titles.en}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
