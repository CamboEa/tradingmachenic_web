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
  const curriculumModule = await getCurriculumModuleForEdit(id);
  if (!curriculumModule) notFound();

  return (
    <div>
      <AdminFormHeader
        backHref="/admin/program"
        title="Edit module"
        description={curriculumModule.title_en}
      />

      <CurriculumModuleForm phaseId={curriculumModule.phase_id} module={curriculumModule} />
    </div>
  );
}
