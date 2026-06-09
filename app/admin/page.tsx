import Link from "next/link";

import { AdminPageHeader, ButtonLink, Card, StatCard } from "@/components/ui";
import { getCurriculum } from "@/lib/supabase/curriculum-data";
import { getAllLessonsForAdmin } from "@/lib/supabase/lessons";
import { cn } from "@/lib/ui/cn";

export default async function AdminDashboard() {
  const [lessons, curriculum] = await Promise.all([
    getAllLessonsForAdmin(),
    getCurriculum(),
  ]);
  const sorted = [...curriculum].sort((a, b) => a.sort_order - b.sort_order);
  const phase0 = sorted[0];
  const phase1 = sorted[1];
  const theoryModules = phase0?.weeks.length ?? 0;
  const practiceModules = phase1?.weeks.length ?? 0;
  const totalVideos = lessons.reduce((acc, l) => acc + l.videos.length, 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Admin workspace"
        title="Dashboard"
        description="Overview of your Algorithmic Alpha Trade content, curriculum, and tools."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Video Lessons"
          value={lessons.length}
          sub={`${totalVideos} total videos`}
          accent="teal"
        />
        <StatCard
          label="Theory modules"
          value={theoryModules}
          sub={phase0?.label_en ?? "Phase I curriculum"}
          accent="gold"
        />
        <StatCard
          label="Practice modules"
          value={practiceModules}
          sub={phase1?.label_en ?? "Phase II curriculum"}
          accent="teal"
        />
        <StatCard label="Tools Published" value={0} sub="Indicators & EAs" accent="slate" />
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/admin/program" variant="gold">
            Manage Program
          </ButtonLink>
          <ButtonLink href="/admin/lessons">Manage Lessons</ButtonLink>
          <ButtonLink href="/admin/tools" variant="secondary" className="bg-slate-brand text-white hover:bg-slate-800 hover:text-white border-slate-brand">
            Create Tool
          </ButtonLink>
          <ButtonLink href="/admin/podcasts" variant="secondary">
            Manage Podcasts
          </ButtonLink>
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Video Lessons
          </h2>
          <Link href="/admin/lessons" className="text-xs font-medium text-teal hover:underline">
            View all →
          </Link>
        </div>
        <Card padding={false} className="overflow-hidden">
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
                  <td className="px-5 py-3 font-medium text-slate-brand">{lesson.titles.en}</td>
                  <td className="px-5 py-3 text-slate-500">{lesson.videos.length}</td>
                  <td className="px-5 py-3 text-slate-500">~{lesson.approximateMinutes} min</td>
                  <td className="px-5 py-3 font-mono text-xs text-slate-400">{lesson.slug}</td>
                  <td className="px-5 py-3 text-right">
                    <ButtonLink
                      href="/admin/lessons"
                      variant="secondary"
                      className="px-3 py-1 text-xs"
                    >
                      Edit
                    </ButtonLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Curriculum Phases
          </h2>
          <Link href="/admin/program" className="text-xs font-medium text-teal hover:underline">
            Manage →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {sorted.map((phase) => {
            const isGold = phase.accent === "gold";
            return (
              <Card key={phase.id}>
                <div className="flex items-center justify-between">
                  <p
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wide",
                      isGold ? "text-gold" : "text-teal",
                    )}
                  >
                    {phase.label_en}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {phase.weeks.length} modules
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {phase.weeks.map((week, i) => (
                    <li key={week.id} className="flex items-center gap-2 text-sm text-slate-600">
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                          isGold ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700",
                        )}
                      >
                        {i + 1}
                      </span>
                      {week.titles.en}
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
