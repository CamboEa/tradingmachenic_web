import { DeleteCurriculumModuleButton } from "@/components/curriculum/delete-curriculum-module-button";
import { DeleteCurriculumPhaseButton } from "@/components/curriculum/delete-curriculum-phase-button";
import {
  AdminPageHeader,
  Badge,
  ButtonLink,
  Card,
  EmptyState,
} from "@/components/ui";
import { getCurriculum } from "@/lib/supabase/curriculum-data";
import { cn } from "@/lib/ui/cn";

export const metadata = { title: "Program Management" };

export default async function ProgramPage() {
  const curriculum = await getCurriculum();
  const sorted = [...curriculum].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      <AdminPageHeader
        title="Program Management"
        description="Phases and modules power the public curriculum page."
        action={
          <ButtonLink href="/admin/program/phase/new" variant="secondary">
            + Add phase
          </ButtonLink>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          title="No curriculum phases yet"
          description="Run the Supabase migration to seed default content, or create a phase manually."
          action={{ href: "/admin/program/phase/new", label: "+ Add phase" }}
        />
      ) : (
        <div className="space-y-10">
          {sorted.map((phase) => {
            const isGold = phase.accent === "gold";
            const accentBorder = isGold ? "border-l-gold" : "border-l-teal";

            return (
              <section key={phase.id}>
                <Card
                  className={cn(
                    "mb-4 flex flex-col gap-3 border-l-4 sm:flex-row sm:items-center sm:justify-between",
                    accentBorder,
                  )}
                >
                  <div>
                    <p
                      className={cn(
                        "text-xs font-semibold uppercase tracking-widest",
                        isGold ? "text-gold" : "text-teal",
                      )}
                    >
                      Order {phase.sort_order} · {phase.slug}
                    </p>
                    <h2 className="mt-0.5 text-base font-bold text-slate-brand">{phase.label_en}</h2>
                    <p className="text-xs text-slate-500">{phase.label_km}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="neutral">{phase.weeks.length} modules</Badge>
                    <ButtonLink
                      href={`/admin/program/module/new?phaseId=${phase.id}`}
                      className="px-3 py-2 text-xs"
                    >
                      + Add module
                    </ButtonLink>
                    <ButtonLink
                      href={`/admin/program/phase/${phase.id}/edit`}
                      variant="secondary"
                      className="px-3 py-2 text-xs"
                    >
                      Edit phase
                    </ButtonLink>
                    <DeleteCurriculumPhaseButton id={phase.id} label={phase.label_en} />
                  </div>
                </Card>

                <Card padding={false} className="overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="w-10 px-5 py-3">#</th>
                        <th className="px-5 py-3">Module title (EN)</th>
                        <th className="px-5 py-3">Module title (KM)</th>
                        <th className="px-5 py-3">Focus (EN)</th>
                        <th className="px-5 py-3">Activities</th>
                        <th className="px-5 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {phase.weeks.map((week, i) => (
                        <tr
                          key={week.id}
                          className={i < phase.weeks.length - 1 ? "border-b border-slate-100" : ""}
                        >
                          <td className="px-5 py-4">
                            <Badge variant={isGold ? "gold" : "teal"} className="h-6 w-6 justify-center p-0">
                              {i + 1}
                            </Badge>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-brand">
                            {week.titles.en}
                          </td>
                          <td className="px-5 py-4 text-slate-500">{week.titles.km}</td>
                          <td className="max-w-xs px-5 py-4 text-xs leading-relaxed text-slate-500">
                            {week.focus.en}
                          </td>
                          <td className="px-5 py-4">
                            <Badge variant="neutral">{week.activities.en.length} items</Badge>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <ButtonLink
                                href={`/admin/program/module/${week.id}/edit`}
                                variant="secondary"
                                className="px-3 py-2 text-xs"
                              >
                                Edit
                              </ButtonLink>
                              <DeleteCurriculumModuleButton id={week.id} title={week.titles.en} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
