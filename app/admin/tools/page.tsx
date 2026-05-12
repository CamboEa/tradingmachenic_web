import Link from "next/link";
import { getAllTools } from "@/lib/supabase/tools";
import { DeleteToolButton } from "@/components/delete-tool-button";

export const metadata = { title: "Tools" };

export default async function ToolsPage() {
  const tools = await getAllTools();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Tools</h1>
          <p className="mt-1 text-sm text-slate-500">
            Publish indicators and expert advisors for your students.
          </p>
        </div>
        <Link
          href="/admin/tools/add"
          className="rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          + Add Tool
        </Link>
      </div>

      {tools.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-14 text-center">
            <svg viewBox="0 0 20 20" fill="currentColor" className="mx-auto h-10 w-10 text-slate-200">
              <path fillRule="evenodd" d="M14.5 10a4.5 4.5 0 0 0 4.284-5.882c-.105-.324-.51-.391-.752-.15L15.34 6.66a.454.454 0 0 1-.493.11 3.01 3.01 0 0 1-1.618-1.616.455.455 0 0 1 .11-.494l2.694-2.692c.24-.241.174-.647-.15-.752a4.5 4.5 0 0 0-5.873 4.575c.055.873-.128 1.808-.8 2.368l-7.23 6.024a2.724 2.724 0 1 0 3.837 3.837l6.024-7.23c.56-.672 1.495-.855 2.368-.8.096.007.193.01.291.01ZM5 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
            </svg>
            <p className="mt-3 text-sm font-medium text-slate-400">No tools yet</p>
            <p className="mt-1 text-xs text-slate-300">Click "Add Tool" to publish your first tool.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {tools.map((tool) => (
            <div key={tool.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-4">
                {/* Preview image */}
                {tool.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tool.image_url}
                    alt={tool.name}
                    className="h-18 w-18 shrink-0 rounded-lg object-cover border border-slate-100"
                  />
                ) : (
                  <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-2xl">
                    {tool.type === "indicator" ? "📊" : "🤖"}
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[#1e293b]">{tool.name}</h3>
                    <span className="text-xs text-slate-400">v{tool.version}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      tool.status === "published" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}>
                      {tool.status === "published" ? "Published" : "Draft"}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      tool.pricing === "free" ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {tool.pricing === "free" ? "Free" : "Paid"}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs text-slate-500">
                    <span className="rounded bg-slate-100 px-2 py-0.5">{tool.platform}</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5">{tool.type === "indicator" ? "Indicator" : "Expert Advisor"}</span>
                  </div>
                  {tool.description_en && (
                    <p className="mt-1.5 truncate text-sm text-slate-500">{tool.description_en}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/admin/tools/edit/${tool.id}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
                  >
                    Edit
                  </Link>
                  <DeleteToolButton id={tool.id} name={tool.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
