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
 className="inline-flex shrink-0 items-center justify-center rounded-lg border border-bridge/40 px-3.5 py-2 text-sm font-medium text-ink-muted transition hover:border-bridge/60 hover:bg-surface-soft"
 >
 ← Back
 </Link>
 <div className="min-w-0 flex-1">
 <h1 className="text-2xl font-bold text-foreground">Edit Tool</h1>
 <p className="mt-1 truncate text-sm text-ink-soft" title={tool.name}>
 {tool.name}
 </p>
 <div className="mt-2 flex flex-wrap items-center gap-2">
 <span className="text-xs text-slate-400">v{tool.version}</span>
 <span
 className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
 tool.status === "published"
 ? "bg-green-100 text-green-700"
 : "bg-surface-soft text-ink-muted"
 }`}
 >
 {tool.status === "published" ? "Published" : "Draft"}
 </span>
 <span
 className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
 tool.pricing === "free"
 ? "bg-surface-soft text-[#1D4ED8]"
 : "bg-amber-500/10 text-amber-400"
 }`}
 >
 {tool.pricing === "free" ? "Free" : "Paid"}
 </span>
 <span className="rounded-full bg-surface-soft px-2.5 py-0.5 text-xs font-medium text-ink-muted">
 {tool.platform}
 </span>
 <span className="rounded-full bg-surface-soft px-2.5 py-0.5 text-xs font-medium text-ink-muted">
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
