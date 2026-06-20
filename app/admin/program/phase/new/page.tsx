import Link from "next/link";
import { CurriculumPhaseForm } from "@/components/curriculum/curriculum-phase-form";

export const metadata = { title: "New curriculum phase" };

export default function NewCurriculumPhasePage() {
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
 <h1 className="text-2xl font-bold text-[#22332E]">New curriculum phase</h1>
 <p className="mt-1 text-sm text-slate-500">Create a phase, then add modules to it.</p>
 </div>
 </div>
 <CurriculumPhaseForm />
 </div>
 );
}
