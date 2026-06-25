import { notFound } from "next/navigation";

import { CurriculumModuleForm } from "@/components/curriculum/curriculum-module-form";
import { AdminBackLink, AdminFormHeader } from "@/components/ui";
import { getCurriculumPhaseForEdit } from "@/lib/supabase/curriculum-data";

export const metadata = { title: "New curriculum module" };

export default async function NewCurriculumModulePage({
  searchParams,
}: {
  searchParams: Promise<{ phaseId?: string }>;
}) {
  const { phaseId } = await searchParams;
  if (!phaseId) {
    return (
      <div>
        <p className="text-sm text-ink-muted">
          Missing phase. Pick a phase from Program Management and use “Add module”.
        </p>
        <div className="mt-4">
          <AdminBackLink href="/admin/program" label="Back to program" />
        </div>
      </div>
    );
  }

  const phase = await getCurriculumPhaseForEdit(phaseId);
  if (!phase) notFound();

  return (
    <div>
      <AdminFormHeader
        backHref="/admin/program"
        title="New module"
        description={`Phase: ${phase.label_en}`}
      />

      <CurriculumModuleForm phaseId={phase.id} />
    </div>
  );
}
