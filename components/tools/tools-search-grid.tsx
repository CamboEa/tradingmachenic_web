"use client";

import { useState } from "react";

import Link from "next/link";

import { Dropdown } from "@/components/ui/dropdown";
import {
  paginateItems,
  SearchGridPagination,
  totalPagesFor,
} from "@/components/ui/search-grid-pagination";
import type { Locale } from "@/lib/i18n";
import type { Tool } from "@/lib/supabase/tools";

function ToolPlaceholder({ type }: { type: Tool["type"] }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 via-white to-[#EFF6FF]">
      <svg viewBox="0 0 64 64" fill="none" className="h-16 w-16 text-slate-300" aria-hidden>
        {type === "indicator" ? (
          <>
            <path d="M12 46h40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M18 40V26M32 40V16M46 40V30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            <path d="M14 24c7 5 12 6 18 1s10-8 18-2" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : (
          <>
            <rect x="15" y="18" width="34" height="28" rx="8" stroke="currentColor" strokeWidth="4" />
            <path d="M24 30h.01M40 30h.01M27 39h10" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" />
            <path d="M32 18v-6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </>
        )}
      </svg>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

function ToolCard({ tool, locale }: { tool: Tool; locale: Locale }) {
  const description = locale === "km" ? tool.description_km : tool.description_en;
  const isFree = tool.pricing === "free";
  const totalDownloads = (tool.download_count ?? 0) + (tool.download_count_mt4 ?? 0) + (tool.download_count_mt5 ?? 0);

  return (
    <Link href={`/${locale}/tools/${tool.id}`} className="ui-content-card group flex flex-col overflow-hidden" style={{ borderRadius: 0 }} aria-label={tool.name}>
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {tool.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={tool.image_url} alt={tool.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        ) : (
          <ToolPlaceholder type={tool.type} />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        <span className={`absolute left-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${isFree ? "bg-[#2563EB] text-white" : "bg-[#d4af37] text-[#1e293b]"}`}>
          {isFree ? "Free" : "Paid"}
        </span>
        <span className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
          {tool.platform}
        </span>
        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
          {tool.type === "indicator" ? "Indicator" : "Expert Advisor"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-bold leading-snug text-[#1e293b] transition-colors group-hover:text-[#2563EB]">{tool.name}</h3>
          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">v{tool.version}</span>
        </div>
        {description ? (
          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-500">{description}</p>
        ) : (
          <p className="mt-2.5 text-sm italic text-slate-300">No description.</p>
        )}
        <div className="my-4 h-px bg-slate-100" />
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs font-semibold text-[#2563EB] transition group-hover:translate-x-0.5">View details →</span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 shrink-0" aria-hidden>
              <path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z" />
              <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
            </svg>
            {formatCount(totalDownloads)}
          </span>
        </div>
      </div>
    </Link>
  );
}

type FilterType = "all" | "indicator" | "ea";

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "indicator", label: "Indicators" },
  { value: "ea", label: "Expert Advisors" },
];

const ITEMS_PER_PAGE = 12;

export function ToolsSearchGrid({ tools, locale }: { tools: Tool[]; locale: Locale }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(0);

  const filtered = tools.filter((t) => {
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    if (!matchesType) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.description_en?.toLowerCase().includes(q) ||
      t.description_km?.toLowerCase().includes(q)
    );
  });

  const totalPages = totalPagesFor(filtered.length, ITEMS_PER_PAGE);
  const paginated = paginateItems(filtered, page, ITEMS_PER_PAGE);

  const handleSearch = (q: string) => {
    setQuery(q);
    setPage(0);
  };

  const handleFilter = (f: FilterType) => {
    setTypeFilter(f);
    setPage(0);
  };

  return (
    <div>
      {/* Search + filter row */}
      <div className="mb-6 flex gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          >
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
          <input
            type="search"
            placeholder="Search tools…"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 shadow-sm transition focus:border-[#2563EB]/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          />
        </div>

        <Dropdown
          value={typeFilter}
          options={FILTER_OPTIONS}
          onChange={handleFilter}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-20 text-center">
          <p className="text-sm font-medium text-slate-400">
            {query.trim()
              ? `No tools match "${query}".`
              : "No tools in this category yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {paginated.map((tool) => (
              <ToolCard key={tool.id} tool={tool} locale={locale} />
            ))}
          </div>

          <SearchGridPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
