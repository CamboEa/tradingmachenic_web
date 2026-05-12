import Link from "next/link";
import { ToolsForm } from "@/components/tools-form";

export const metadata = { title: "Add Tool" };

export default function AddToolPage() {
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
          <h1 className="text-2xl font-bold text-[#1e293b]">Add New Tool</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create a new indicator or expert advisor.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <ToolsForm />

        {/* Info sidebar */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-[#1e293b]">
            Publishing Tips
          </h2>
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
              <h3 className="mb-1 font-semibold text-[#1e293b]">
                Installation guide
              </h3>
              <p>Link to a video or documentation showing how to install</p>
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-[#1e293b]">Description</h3>
              <p>Provide clear descriptions in both English and Khmer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
