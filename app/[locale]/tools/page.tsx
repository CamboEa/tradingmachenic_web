import { notFound } from "next/navigation";
import Link from "next/link";

import { EmptyState, PublicPageHero, PublicPageMain } from "@/components/ui";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getPublishedTools, type Tool } from "@/lib/supabase/tools";

function ToolPlaceholder({ type }: { type: Tool["type"] }) {
 return (
 <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 via-white to-sky-50">
 <svg
 viewBox="0 0 64 64"
 fill="none"
 className="h-16 w-16 text-slate-300"
 aria-hidden
 >
 {type === "indicator" ? (
 <>
 <path d="M12 46h40" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
 <path d="M18 40V26M32 40V16M46 40V30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
 <path d="M14 24c7 5 12 6 18 1s10-8 18-2" stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round" />
 </>
 ) : (
 <>
 <rect x="15" y="18" width="34" height="28" rx="8" stroke="currentColor" strokeWidth="4" />
 <path d="M24 30h.01M40 30h.01M27 39h10" stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round" />
 <path d="M32 18v-6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
 </>
 )}
 </svg>
 </div>
 );
}

/* ── Single tool card ─────────────────────────────────────── */
function ToolCard({ tool, locale }: { tool: Tool; locale: Locale }) {
 const description = locale === "km" ? tool.description_km : tool.description_en;
 const isFree = tool.pricing === "free";

 return (
 <Link href={`/${locale}/tools/${tool.id}`} className="ui-content-card group flex flex-col overflow-hidden" aria-label={tool.name}>

 {/* ── Image area ── */}
 <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
 {tool.image_url ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img
 src={tool.image_url}
 alt={tool.name}
 className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
 />
 ) : (
 <ToolPlaceholder type={tool.type} />
 )}

 {/* Dark gradient overlay */}
 <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

 {/* Free / Paid badge — top left */}
 <span className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest ${
 isFree
 ? "bg-[#0ea5e9] text-white"
 : "bg-[#d4af37] text-[#1e293b]"
 }`}>
 {isFree ? "Free" : "Paid"}
 </span>

 {/* Platform — bottom right */}
 <span className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
 {tool.platform}
 </span>

 {/* Type tag — bottom left */}
 <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
 {tool.type === "indicator" ? "Indicator" : "Expert Advisor"}
 </span>
 </div>

 {/* ── Body ── */}
 <div className="flex flex-1 flex-col p-5">
 {/* Name + version */}
 <div className="flex items-baseline justify-between gap-2">
 <h3 className="font-bold leading-snug text-[#1e293b] transition-colors group-hover:text-[#0ea5e9]">
 {tool.name}
 </h3>
 <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
 v{tool.version}
 </span>
 </div>

 {/* Description */}
 {description ? (
 <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-500">
 {description}
 </p>
 ) : (
 <p className="mt-2.5 text-sm italic text-slate-300">No description.</p>
 )}

 {/* Divider */}
 <div className="my-4 h-px bg-slate-100" />

 {/* CTA hint */}
 <div className="mt-auto flex items-center justify-between">
 <span className="text-xs font-semibold text-[#0ea5e9] transition group-hover:translate-x-0.5">View details →</span>
 {tool.pricing === "free" && (
 <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-[#0ea5e9]">Free Download</span>
 )}
 </div>
 </div>
 </Link>
 );
}

/* ── Filter tabs (server-side via searchParams) ───────────── */
function FilterTabs({
 locale,
 active,
 counts,
}: {
 locale: string;
 active: string;
 counts: { all: number; indicator: number; ea: number };
}) {
 const tabs = [
 { key: "all", label: "All Tools", count: counts.all },
 { key: "indicator", label: "Indicators", count: counts.indicator },
 { key: "ea", label: "Expert Advisors", count: counts.ea },
 ];

 return (
 <div className="flex flex-wrap items-center gap-1 rounded-2xl border border-slate-200/90 bg-white/85 p-1 backdrop-blur">
 {tabs.map((tab) => (
 <Link
 key={tab.key}
 href={`/${locale}/tools${tab.key !== "all" ? `?type=${tab.key}` : ""}`}
 className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
 active === tab.key
 ? "bg-[#1e293b] text-white"
 : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
 }`}
 >
 {tab.label}
 <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
 active === tab.key
 ? "bg-white/20 text-white"
 : "bg-slate-100 text-slate-400"
 }`}>
 {tab.count}
 </span>
 </Link>
 ))}
 </div>
 );
}

/* ── Page ─────────────────────────────────────────────────── */
export default async function ToolsPage({
 params,
 searchParams,
}: {
 params: Promise<{ locale: string }>;
 searchParams: Promise<{ type?: string }>;
}) {
 const { locale: raw } = await params;
 if (!isLocale(raw)) notFound();
 const locale = raw as Locale;
 const dict = await getDictionary(locale);
 const t = dict.toolsPage;
 const { type } = await searchParams;

 const allTools = await getPublishedTools();
 const activeFilter = type === "indicator" || type === "ea" ? type : "all";
 const displayed = activeFilter === "all" ? allTools : allTools.filter((t) => t.type === activeFilter);

 const counts = {
 all: allTools.length,
 indicator: allTools.filter((t) => t.type === "indicator").length,
 ea: allTools.filter((t) => t.type === "ea").length,
 };

 return (
 <div className="flex flex-col">
 <PublicPageHero eyebrow={t.eyebrow} title={t.title} description={t.intro} />
 <PublicPageMain>
 {allTools.length === 0 ? (
 <EmptyState title={t.comingSoon} description={t.comingSoonDetail} className="mt-4" />
 ) : (
 <>
 {/* Filter tabs */}
 <div className="mb-8 flex items-center justify-between gap-4">
 <FilterTabs locale={locale} active={activeFilter} counts={counts} />
 <p className="hidden text-sm text-slate-400 sm:block">
 {displayed.length} tool{displayed.length !== 1 ? "s" : ""}
 </p>
 </div>

 {/* Grid */}
 {displayed.length === 0 ? (
 <div className="rounded-xl border border-dashed border-slate-200 py-20 text-center">
 <p className="text-sm font-medium text-slate-400">No tools in this category yet.</p>
 </div>
 ) : (
 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
 {displayed.map((tool) => (
 <ToolCard key={tool.id} tool={tool} locale={locale} />
 ))}
 </div>
 )}
 </>
 )}
 </PublicPageMain>
 </div>
 );
}
