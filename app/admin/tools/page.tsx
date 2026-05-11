import { R2Uploader } from "@/components/r2-uploader";

export const metadata = { title: "Tools" };

const TOOL_TYPES = ["Indicator", "Expert Advisor (EA)"] as const;
const PLATFORMS = ["MT4", "MT5", "MT4 & MT5"] as const;

export default function ToolsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#1e293b]">Tools</h1>
        <p className="mt-1 text-sm text-slate-500">
          Publish indicators and expert advisors for your students.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        {/* Create form */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-base font-bold text-[#1e293b]">
            Create New Tool
          </h2>

          <form className="space-y-5">
            {/* Tool type */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Tool type
              </label>
              <div className="flex gap-3">
                {TOOL_TYPES.map((t) => (
                  <label
                    key={t}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-colors has-[:checked]:border-[#0ea5e9] has-[:checked]:bg-sky-50"
                  >
                    <input
                      type="radio"
                      name="toolType"
                      value={t}
                      defaultChecked={t === "Indicator"}
                      className="accent-[#0ea5e9]"
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Name
              </label>
              <input
                type="text"
                placeholder="e.g. TM Risk Manager v1"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
              />
            </div>

            {/* Version */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Version
              </label>
              <input
                type="text"
                placeholder="e.g. 1.0.0"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
              />
            </div>

            {/* Platform */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Platform
              </label>
              <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20">
                {PLATFORMS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Description EN */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Description (English)
              </label>
              <textarea
                rows={3}
                placeholder="What does this tool do? What problem does it solve?"
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
              />
            </div>

            {/* Description KM */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Description (Khmer)
              </label>
              <textarea
                rows={3}
                placeholder="ការពិពណ៌នា..."
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
              />
            </div>

            {/* File upload */}
            <R2Uploader
              folder="tools"
              accept=".ex4,.ex5,.mq4,.mq5,.zip"
              label="File (.ex4 / .ex5 / .mq4 / .mq5)"
              hint=".ex4, .ex5, .mq4, .mq5, .zip — max 20 MB"
              onUploaded={(url) => console.log("Tool uploaded:", url)}
            />

            {/* Install guide URL */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Install guide URL{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="url"
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Status
              </label>
              <div className="flex gap-3">
                {["Draft", "Published"].map((s) => (
                  <label
                    key={s}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-colors has-[:checked]:border-[#0ea5e9] has-[:checked]:bg-sky-50"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={s}
                      defaultChecked={s === "Draft"}
                      className="accent-[#0ea5e9]"
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-[#1e293b] py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f172a]"
            >
              Publish Tool
            </button>
          </form>
        </div>

        {/* Published tools list */}
        <div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-base font-bold text-[#1e293b]">
              Published Tools
            </h2>
            <p className="mb-6 text-xs text-slate-400">
              No tools published yet.
            </p>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 py-14 text-center">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="mx-auto h-10 w-10 text-slate-200"
              >
                <path
                  fillRule="evenodd"
                  d="M14.5 10a4.5 4.5 0 0 0 4.284-5.882c-.105-.324-.51-.391-.752-.15L15.34 6.66a.454.454 0 0 1-.493.11 3.01 3.01 0 0 1-1.618-1.616.455.455 0 0 1 .11-.494l2.694-2.692c.24-.241.174-.647-.15-.752a4.5 4.5 0 0 0-5.873 4.575c.055.873-.128 1.808-.8 2.368l-7.23 6.024a2.724 2.724 0 1 0 3.837 3.837l6.024-7.23c.56-.672 1.495-.855 2.368-.8.096.007.193.01.291.01ZM5 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="mt-3 text-sm font-medium text-slate-400">
                No tools yet
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Fill the form and publish your first tool.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
