import Link from "next/link";
import { notFound } from "next/navigation";
import { CurriculumPhaseForm } from "@/components/curriculum-phase-form";
import { getCurriculumPhaseForEdit } from "@/lib/supabase/curriculum-data";

export const metadata = { title: "Edit curriculum phase" };

export default async function EditCurriculumPhasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const phase = await getCurriculumPhaseForEdit(id);
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
          <h1 className="text-2xl font-bold text-[#1e293b]">Edit phase</h1>
          <p className="mt-1 truncate text-sm text-slate-500" title={phase.label_en}>
            {phase.label_en}
          </p>
        </div>
      </div>
      <CurriculumPhaseForm phase={phase} />
    </div>
  );
}
