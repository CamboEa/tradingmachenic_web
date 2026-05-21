import Link from "next/link";
import { DeleteCurriculumModuleButton } from "@/components/curriculum/delete-curriculum-module-button";
import { DeleteCurriculumPhaseButton } from "@/components/curriculum/delete-curriculum-phase-button";
import { getCurriculum } from "@/lib/supabase/curriculum-data";

export const metadata = { title: "Program Management" };

export default async function ProgramPage() {
 const curriculum = await getCurriculum();
 const sorted = [...curriculum].sort((a, b) => a.sort_order - b.sort_order);

 return (
 <div>
 <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
 <div>
 <h1 className="text-2xl font-bold text-[#1e293b]">Program Management</h1>
 <p className="mt-1 text-sm text-slate-500">
 Phases and modules power the public curriculum page.
 </p>
 </div>
 <div className="flex flex-wrap gap-2">
 <Link
 href="/admin/program/phase/new"
 className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#1e293b] transition hover:bg-slate-50"
 >
 + Add phase
 </Link>
 </div>
 </div>

 {sorted.length === 0 ? (
 <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
 <p className="text-sm font-medium text-slate-500">No curriculum phases yet.</p>
 <p className="mt-1 text-sm text-slate-400">
 Run the Supabase migration to seed default content, or create a phase manually.
 </p>
 <Link
 href="/admin/program/phase/new"
 className="mt-6 inline-flex rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
 >
 + Add phase
 </Link>
 </div>
 ) : (
 <div className="space-y-10">
 {sorted.map((phase) => {
 const isGold = phase.accent === "gold";
 const accentBorder = isGold ? "border-l-[#d4af37]" : "border-l-[#0ea5e9]";
 const accentText = isGold ? "text-[#d4af37]" : "text-[#0ea5e9]";
 const badgeBg = isGold ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700";

 return (
 <section key={phase.id}>
 <div
 className={`mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 border-l-4 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${accentBorder}`}
 >
 <div>
 <p className={`text-xs font-semibold uppercase tracking-widest ${accentText}`}>
 Order {phase.sort_order} · {phase.slug}
 </p>
 <h2 className="mt-0.5 text-base font-bold text-[#1e293b]">{phase.label_en}</h2>
 <p className="text-xs text-slate-500">{phase.label_km}</p>
 </div>
 <div className="flex flex-wrap items-center gap-2">
 <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">
 {phase.weeks.length} modules
 </span>
 <Link
 href={`/admin/program/module/new?phaseId=${phase.id}`}
 className="rounded-md bg-[#0ea5e9] px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-600"
 >
 + Add module
 </Link>
 <Link
 href={`/admin/program/phase/${phase.id}/edit`}
 className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
 >
 Edit phase
 </Link>
 <DeleteCurriculumPhaseButton id={phase.id} label={phase.label_en} />
 </div>
 </div>

 <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
 <th className="w-10 px-5 py-3">#</th>
 <th className="px-5 py-3">Module title (EN)</th>
 <th className="px-5 py-3">Module title (KM)</th>
 <th className="px-5 py-3">Focus (EN)</th>
 <th className="px-5 py-3">Activities</th>
 <th className="px-5 py-3" />
 </tr>
 </thead>
 <tbody>
 {phase.weeks.map((week, i) => (
 <tr
 key={week.id}
 className={i < phase.weeks.length - 1 ? "border-b border-slate-100" : ""}
 >
 <td className="px-5 py-4">
 <span
 className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${badgeBg}`}
 >
 {i + 1}
 </span>
 </td>
 <td className="px-5 py-4 font-semibold text-[#1e293b]">{week.titles.en}</td>
 <td className="px-5 py-4 text-slate-500">{week.titles.km}</td>
 <td className="max-w-xs px-5 py-4 text-xs leading-relaxed text-slate-500">
 {week.focus.en}
 </td>
 <td className="px-5 py-4">
 <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600">
 {week.activities.en.length} items
 </span>
 </td>
 <td className="px-5 py-4 text-right">
 <div className="flex items-center justify-end gap-2">
 <Link
 href={`/admin/program/module/${week.id}/edit`}
 className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
 >
 Edit
 </Link>
 <DeleteCurriculumModuleButton id={week.id} title={week.titles.en} />
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </section>
 );
 })}
 </div>
 )}
 </div>
 );
}
