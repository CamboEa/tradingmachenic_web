import { notFound } from "next/navigation";

import { CurriculumPhaseForm } from "@/components/curriculum/curriculum-phase-form";
import { AdminFormHeader } from "@/components/ui";
import { getCurriculumPhaseForEdit } from "@/lib/supabase/curriculum-data";

export const metadata = { title: "Edit curriculum phase" };

export default async function EditCurriculumPhasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const phase = await getCurriculumPhaseForEdit(id);
  if (!phase) notFound();

  return (
    <div>
      <AdminFormHeader
        backHref="/admin/program"
        title="Edit phase"
        description={phase.label_en}
      />

      <CurriculumPhaseForm phase={phase} />
    </div>
  );
}
