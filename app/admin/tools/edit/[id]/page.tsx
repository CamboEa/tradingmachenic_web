import { notFound } from "next/navigation";
import Link from "next/link";
import { getToolForEdit } from "@/lib/supabase/actions";
import { ToolsForm } from "@/components/tools-form";

export const metadata = { title: "Edit Tool" };

export default async function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tool = await getToolForEdit(id);

  if (!tool) notFound();

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/tools"
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#1e293b] transition hover:bg-slate-50"
        >
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Edit Tool</h1>
          <p className="mt-1 text-sm text-slate-500">{tool.name}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <ToolsForm tool={tool} />

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-[#1e293b]">Publishing Tips</h2>
          <div className="space-y-4 text-sm text-slate-600">
            <div>
              <h3 className="mb-1 font-semibold text-[#1e293b]">File formats</h3>
              <p>.ex4, .ex5, .mq4, .mq5, or .zip</p>
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-[#1e293b]">Max size</h3>
              <p>20 MB per file</p>
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-[#1e293b]">Preview image</h3>
              <p>PNG, JPG, or WebP showing the tool in action</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
