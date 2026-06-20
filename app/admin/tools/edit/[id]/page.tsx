import { notFound } from "next/navigation";
import Link from "next/link";
import { getToolForEdit } from "@/lib/supabase/actions";
import { ToolsForm } from "@/components/tools/tools-form";

export const metadata = { title: "Edit Tool" };

export default async function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
 const { id } = await params;
 const tool = await getToolForEdit(id);

 if (!tool) notFound();

 return (
 <div>
 <div className="mb-8 flex flex-col gap-4">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
 <Link
 href="/admin/tools"
 className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
 >
 ← Back
 </Link>
 <div className="min-w-0 flex-1">
 <h1 className="text-2xl font-bold text-[#22332E]">Edit Tool</h1>
 <p className="mt-1 truncate text-sm text-slate-500" title={tool.name}>
 {tool.name}
 </p>
 <div className="mt-2 flex flex-wrap items-center gap-2">
 <span className="text-xs text-slate-400">v{tool.version}</span>
 <span
 className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
 tool.status === "published"
 ? "bg-green-100 text-green-700"
 : "bg-slate-100 text-slate-600"
 }`}
 >
 {tool.status === "published" ? "Published" : "Draft"}
 </span>
 <span
 className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
 tool.pricing === "free"
 ? "bg-[#EEF8F7] text-[#1D4ED8]"
 : "bg-amber-50 text-amber-900"
 }`}
 >
 {tool.pricing === "free" ? "Free" : "Paid"}
 </span>
 <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
 {tool.platform}
 </span>
 <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
 {tool.type === "indicator" ? "Indicator" : "Expert Advisor"}
 </span>
 </div>
 </div>
 </div>
 </div>

 <ToolsForm tool={tool} />
 </div>
 );
}
