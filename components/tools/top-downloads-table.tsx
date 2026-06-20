import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import type { Tool } from "@/lib/supabase/tools";
import { formatDownloadCount, getToolDownloadTotal, sortToolsByDownloads } from "@/lib/tools/download-stats";

const LABELS = {
  en: {
    rank: "#",
    tool: "Tool",
    type: "Type",
    platform: "Platform",
    downloads: "Downloads",
    indicator: "Indicator",
    ea: "Expert Advisor",
    mtBreakdown: (mt4: number, mt5: number) => `MT4 ${mt4} · MT5 ${mt5}`,
  },
  km: {
    rank: "#",
    tool: "ឧបករណ៍",
    type: "ប្រភេទ",
    platform: "វេទិកា",
    downloads: "ទាញយក",
    indicator: "សញ្ញាបង្ហាញ",
    ea: "Expert Advisor",
    mtBreakdown: (mt4: number, mt5: number) => `MT4 ${mt4} · MT5 ${mt5}`,
  },
} as const;

export function TopDownloadsTable({
  tools,
  locale,
  limit = 10,
}: {
  tools: Tool[];
  locale: Locale;
  limit?: number;
}) {
  const t = LABELS[locale];
  const top = sortToolsByDownloads(tools).slice(0, limit);

  if (top.length === 0) return null;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-full table-fixed border-collapse text-left">
          <colgroup>
            <col style={{ width: "3.5rem" }} />
            <col />
            <col style={{ width: "11rem" }} />
            <col style={{ width: "9rem" }} />
            <col style={{ width: "8.5rem" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-linear-to-r from-[#22332E] to-[#12352f]">
              <th className="w-12 px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/70">
                {t.rank}
              </th>
              <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/90">
                {t.tool}
              </th>
              <th className="hidden px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/70 sm:table-cell">
                {t.type}
              </th>
              <th className="hidden px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/70 md:table-cell">
                {t.platform}
              </th>
              <th className="px-4 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-white/70">
                {t.downloads}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {top.map((tool, i) => {
              const total = getToolDownloadTotal(tool);
              const description = locale === "km" ? tool.description_km : tool.description_en;

              return (
                <tr key={tool.id} className="transition hover:bg-slate-50/80">
                  <td className="px-4 py-4 text-sm font-bold tabular-nums text-slate-300">
                    {i + 1}
                  </td>
                  <td className="min-w-0 px-4 py-4">
                    <Link
                      href={`/${locale}/tools/${tool.id}`}
                      className="group flex w-full items-center gap-3"
                    >
                      {tool.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={tool.image_url}
                          alt=""
                          className="h-10 w-16 shrink-0 rounded-md object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md bg-slate-100 ring-1 ring-slate-200">
                          <svg viewBox="0 0 20 20" className="h-5 w-5 text-slate-300" aria-hidden>
                            <path d="M4 14h12M6 12V8M10 12V5M14 12V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="font-semibold text-slate-900 transition group-hover:text-teal">
                            {tool.name}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">v{tool.version}</span>
                        </div>
                        {description ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                            {description}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-4 sm:table-cell">
                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      {tool.type === "indicator" ? t.indicator : t.ea}
                    </span>
                  </td>
                  <td className="hidden px-4 py-4 text-sm text-slate-600 md:table-cell">
                    {tool.platform}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="font-semibold tabular-nums text-slate-900">
                      {formatDownloadCount(total)}
                    </div>
                    {tool.platform === "MT4 & MT5" ? (
                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {t.mtBreakdown(tool.download_count_mt4 ?? 0, tool.download_count_mt5 ?? 0)}
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
