import { notFound } from "next/navigation";

import { CurriculumModuleForm } from "@/components/curriculum/curriculum-module-form";
import { AdminFormHeader } from "@/components/ui";
import { getCurriculumModuleForEdit } from "@/lib/supabase/curriculum-data";

export const metadata = { title: "Edit curriculum module" };

export default async function EditCurriculumModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const module = await getCurriculumModuleForEdit(id);
  if (!module) notFound();

  return (
    <div>
      <AdminFormHeader
        backHref="/admin/program"
        title="Edit module"
        description={module.title_en}
      />

      <CurriculumModuleForm phaseId={module.phase_id} module={module} />
    </div>
  );
}
