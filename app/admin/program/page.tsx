import { DeleteCurriculumModuleButton } from "@/components/curriculum/delete-curriculum-module-button";
import { DeleteCurriculumPhaseButton } from "@/components/curriculum/delete-curriculum-phase-button";
import {
  AdminPageHeader,
  Badge,
  ButtonLink,
  Card,
  DataTable,
  EditLink,
  EmptyState,
  RowActions,
  Td,
  Th,
  Tr,
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
                    <h2 className="mt-0.5 text-base font-bold text-foreground">{phase.label_en}</h2>
                    <p className="text-xs text-ink-soft">{phase.label_km}</p>
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

                {phase.weeks.length === 0 ? (
                  <Card className="text-center text-sm text-ink-soft">
                    No modules in this phase yet.
                  </Card>
                ) : (
                  <DataTable
                    head={
                      <>
                        <Th className="w-12" align="center">
                          #
                        </Th>
                        <Th>Module title (EN)</Th>
                        <Th>Module title (KM)</Th>
                        <Th>Focus (EN)</Th>
                        <Th align="center">Activities</Th>
                        <Th align="right">Actions</Th>
                      </>
                    }
                  >
                    {phase.weeks.map((week, i) => (
                      <Tr key={week.id}>
                        <Td align="center">
                          <Badge
                            variant={isGold ? "gold" : "teal"}
                            className="h-6 w-6 justify-center p-0"
                          >
                            {i + 1}
                          </Badge>
                        </Td>
                        <Td className="font-semibold text-foreground">{week.titles.en}</Td>
                        <Td className="text-ink-soft">{week.titles.km}</Td>
                        <Td className="max-w-xs text-xs leading-relaxed text-ink-soft">
                          {week.focus.en}
                        </Td>
                        <Td align="center">
                          <Badge variant="neutral">{week.activities.en.length}</Badge>
                        </Td>
                        <Td align="right">
                          <RowActions>
                            <EditLink href={`/admin/program/module/${week.id}/edit`} />
                            <DeleteCurriculumModuleButton id={week.id} title={week.titles.en} />
                          </RowActions>
                        </Td>
                      </Tr>
                    ))}
                  </DataTable>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
