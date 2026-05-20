import Link from "next/link";
import { ToolsForm } from "@/components/tools-form";

export const metadata = { title: "Add Tool" };

export default function AddToolPage() {
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
 <h1 className="text-2xl font-bold text-[#1e293b]">Add New Tool</h1>
 <p className="mt-1 text-sm text-slate-500">
 Follow the five steps to add an indicator or expert advisor.
 </p>
 </div>
 </div>
 </div>

 <ToolsForm />
 </div>
 );
}
