import Link from "next/link";

import {
  AdminPageHeader,
  Card,
  DataTable,
  EditLink,
  RowActions,
  StatCard,
  Td,
  Th,
  Tr,
} from "@/components/ui";
import { getCurriculum } from "@/lib/supabase/curriculum-data";
import { BRAND_NAME } from "@/lib/brand";
import { getAllLessonsForAdmin } from "@/lib/supabase/lessons";
import { getAllTools } from "@/lib/supabase/tools";
import { cn } from "@/lib/ui/cn";

export default async function AdminDashboard() {
  const [lessons, curriculum, tools] = await Promise.all([
    getAllLessonsForAdmin(),
    getCurriculum(),
    getAllTools(),
  ]);
  const sorted = [...curriculum].sort((a, b) => a.sort_order - b.sort_order);
  const phase0 = sorted[0];
  const phase1 = sorted[1];
  const theoryModules = phase0?.weeks.length ?? 0;
  const practiceModules = phase1?.weeks.length ?? 0;
  const totalVideos = lessons.reduce((acc, l) => acc + l.videos.length, 0);
  const publishedTools = tools.filter((t) => t.status === "published").length;
  const totalDownloads = tools.reduce((acc, t) => acc + (t.download_count ?? 0), 0);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Admin workspace"
        title="Dashboard"
        description={`Overview of your ${BRAND_NAME} content, curriculum, and tools.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
        <StatCard
          label="Tools Published"
          value={publishedTools}
          sub={`${tools.length} total · indicators & EAs`}
          accent="slate"
        />
        <StatCard
          label="Tool Downloads"
          value={totalDownloads}
          sub="All-time across every tool"
          accent="gold"
        />
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
        {lessons.length === 0 ? (
          <Card className="text-center text-sm text-slate-400">No lessons yet.</Card>
        ) : (
          <DataTable
            head={
              <>
                <Th>Title</Th>
                <Th align="center">Videos</Th>
                <Th>Duration</Th>
                <Th>Slug</Th>
                <Th align="right">Actions</Th>
              </>
            }
          >
            {lessons.slice(0, 6).map((lesson) => (
              <Tr key={lesson.slug}>
                <Td className="font-medium text-slate-brand">{lesson.titles.en}</Td>
                <Td align="center" className="tabular-nums text-ink-soft">
                  {lesson.videos.length}
                </Td>
                <Td className="whitespace-nowrap text-ink-soft">~{lesson.approximateMinutes} min</Td>
                <Td className="font-mono text-xs text-slate-400">{lesson.slug}</Td>
                <Td align="right">
                  <RowActions>
                    <EditLink href={`/admin/lessons/edit/${lesson.slug}`} />
                  </RowActions>
                </Td>
              </Tr>
            ))}
          </DataTable>
        )}
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
                  <span className="rounded-full bg-surface-soft px-2.5 py-0.5 text-xs font-medium text-ink-muted">
                    {phase.weeks.length} modules
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {phase.weeks.map((week, i) => (
                    <li key={week.id} className="flex items-center gap-2 text-sm text-ink-muted">
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                          isGold ? "bg-amber-500/15 text-amber-400" : "bg-sky-500/15 text-sky-400",
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
