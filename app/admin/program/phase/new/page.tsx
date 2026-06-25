import { CurriculumPhaseForm } from "@/components/curriculum/curriculum-phase-form";
import { AdminFormHeader } from "@/components/ui";

export const metadata = { title: "New curriculum phase" };

export default function NewCurriculumPhasePage() {
  return (
    <div>
      <AdminFormHeader
        backHref="/admin/program"
        title="New curriculum phase"
        description="Create a phase, then add modules to it."
      />

      <CurriculumPhaseForm />
    </div>
  );
}
