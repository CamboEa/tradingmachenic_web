import Link from "next/link";
import { notFound } from "next/navigation";
import { CurriculumModuleForm } from "@/components/curriculum/curriculum-module-form";
import { getCurriculumModuleForEdit } from "@/lib/supabase/curriculum-data";

export const metadata = { title: "Edit curriculum module" };

export default async function EditCurriculumModulePage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const module = await getCurriculumModuleForEdit(id);
 if (!module) notFound();

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
 <h1 className="text-2xl font-bold text-[#1e293b]">Edit module</h1>
 <p className="mt-1 truncate text-sm text-slate-500" title={module.title_en}>
 {module.title_en}
 </p>
 </div>
 </div>
 <CurriculumModuleForm phaseId={module.phase_id} module={module} />
 </div>
 );
}
