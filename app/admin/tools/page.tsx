import Link from "next/link";
import { getAllTools } from "@/lib/supabase/tools";
import { DeleteToolButton } from "@/components/delete-tool-button";

export const metadata = { title: "Tools" };

export default async function ToolsPage() {
  const tools = await getAllTools();

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Tools</h1>
          <p className="mt-1 text-sm text-slate-500">
            Publish indicators and expert advisors for your students.
          </p>
        </div>
        <Link
          href="/admin/tools/add"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
        >
          + Add Tool
        </Link>
      </div>

      {tools.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500">No tools yet</p>
          <p className="mt-1.5 text-sm text-slate-400">
            Add your first indicator or expert advisor to show it on the public tools page.
          </p>
          <Link
            href="/admin/tools/add"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
          >
            + Add Tool
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-start sm:gap-5">
                <div className="flex min-w-0 flex-1 gap-4">
                  {tool.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tool.image_url}
                      alt=""
                      className="size-20 shrink-0 rounded-lg border border-slate-100 object-cover"
                    />
                  ) : (
                    <div
                      className="flex size-20 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-2xl"
                      aria-hidden
                    >
                      {tool.type === "indicator" ? "📊" : "🤖"}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-[#1e293b]">{tool.name}</p>
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
                            ? "bg-sky-50 text-sky-700"
                            : "bg-amber-50 text-amber-900"
                        }`}
                      >
                        {tool.pricing === "free" ? "Free" : "Paid"}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {tool.platform}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {tool.type === "indicator" ? "Indicator" : "Expert Advisor"}
                      </span>
                    </div>
                    {tool.description_en && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">
                        {tool.description_en}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
                  <Link
                    href={`/admin/tools/edit/${tool.id}`}
                    className="rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
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
