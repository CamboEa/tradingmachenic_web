import Link from "next/link";
import { notFound } from "next/navigation";
import { CurriculumModuleForm } from "@/components/curriculum/curriculum-module-form";
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
 <p className="text-sm text-ink-muted">Missing phase. Pick a phase from Program Management and use “Add module”.</p>
 <Link href="/admin/program" className="mt-4 inline-block text-sm font-medium text-foreground hover:underline">
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
 className="inline-flex shrink-0 items-center justify-center rounded-lg border border-bridge/40 px-3.5 py-2 text-sm font-medium text-ink-muted transition hover:border-bridge/60 hover:bg-surface-soft"
 >
 ← Back
 </Link>
 <div>
 <h1 className="text-2xl font-bold text-foreground">New module</h1>
 <p className="mt-1 text-sm text-ink-soft">Phase: {phase.label_en}</p>
 </div>
 </div>
 <CurriculumModuleForm phaseId={phase.id} />
 </div>
 );
}
