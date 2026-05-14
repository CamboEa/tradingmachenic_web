import Link from "next/link";
import { notFound } from "next/navigation";
import { CurriculumModuleForm } from "@/components/curriculum-module-form";
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
        <p className="text-sm text-slate-600">Missing phase. Pick a phase from Program Management and use “Add module”.</p>
        <Link href="/admin/program" className="mt-4 inline-block text-sm font-medium text-[#0ea5e9] hover:underline">
          ← Back to program
        </Link>
      </div>
    );
  }

  const phase = await getCurriculumPhaseForEdit(phaseId);
  if (!phase) notFound();

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Link
          href="/admin/program"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
        >
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">New module</h1>
          <p className="mt-1 text-sm text-slate-500">Phase: {phase.label_en}</p>
        </div>
      </div>
      <CurriculumModuleForm phaseId={phase.id} />
    </div>
  );
}
