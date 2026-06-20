import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState, PublicPageHero } from "@/components/ui";
import { ToolsSearchGrid } from "@/components/tools/tools-search-grid";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getPublishedTools, type Tool } from "@/lib/supabase/tools";

function TopToolsSidebar({ tools, locale }: { tools: Tool[]; locale: Locale }) {
  const top10 = [...tools]
    .sort((a, b) => {
      const aTotal = (a.download_count ?? 0) + (a.download_count_mt4 ?? 0) + (a.download_count_mt5 ?? 0);
      const bTotal = (b.download_count ?? 0) + (b.download_count_mt4 ?? 0) + (b.download_count_mt5 ?? 0);
      return bTotal - aTotal;
    })
    .slice(0, 10);

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-linear-to-r from-[#0D1B33] to-[#0f1f35] px-4 py-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#4B78F8]/20">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[#4B78F8]" aria-hidden>
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white">
              {locale === "km" ? "ឧបករណ៍ពេញនិយម" : "Top Downloads"}
            </p>
            <p className="text-[10px] text-slate-400">
              {locale === "km" ? "កំពូលទាំង ១០" : "Most downloaded tools"}
            </p>
          </div>
        </div>
        <ol className="divide-y divide-slate-100">
          {top10.map((tool, i) => {
            const total = (tool.download_count ?? 0) + (tool.download_count_mt4 ?? 0) + (tool.download_count_mt5 ?? 0);
            const count = total >= 1000 ? `${(total / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(total);
            return (
              <li key={tool.id}>
                <Link
                  href={`/${locale}/tools/${tool.id}`}
                  className="group flex items-center gap-3 px-4 py-3 transition hover:bg-slate-50"
                >
                  <span className="w-5 shrink-0 text-right text-[11px] font-bold text-slate-300">
                    {i + 1}
                  </span>
                  {tool.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={tool.image_url}
                      alt={tool.name}
                      className="h-9 w-14 shrink-0 object-cover"
                    />
                  ) : (
                    <div className="h-9 w-14 shrink-0 bg-slate-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-700 transition group-hover:text-[#1E3EE8]">
                      {tool.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{tool.platform}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-slate-400">
                    <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden>
                      <path d="M8.75 2.75a.75.75 0 0 0-1.5 0v5.69L5.03 6.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06 0l3.5-3.5a.75.75 0 0 0-1.06-1.06L8.75 8.44V2.75Z" />
                      <path d="M3.5 9.75a.75.75 0 0 0-1.5 0v1.5A2.75 2.75 0 0 0 4.75 14h6.5A2.75 2.75 0 0 0 14 11.25v-1.5a.75.75 0 0 0-1.5 0v1.5c0 .69-.56 1.25-1.25 1.25h-6.5c-.69 0-1.25-.56-1.25-1.25v-1.5Z" />
                    </svg>
                    {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const t = dict.toolsPage;

  const rawTools = await getPublishedTools();
  const tools = [...rawTools].sort((a, b) => {
    const aTotal = (a.download_count ?? 0) + (a.download_count_mt4 ?? 0) + (a.download_count_mt5 ?? 0);
    const bTotal = (b.download_count ?? 0) + (b.download_count_mt4 ?? 0) + (b.download_count_mt5 ?? 0);
    return bTotal - aTotal;
  });

  return (
    <div className="flex flex-col">
      <PublicPageHero eyebrow={t.eyebrow} title={t.title} backgroundImage="/Images/bg-tool-header.png" className="py-24 sm:py-28" />
      <main className="w-full flex-1 px-3.75 py-10">
        {tools.length === 0 ? (
          <EmptyState title={t.comingSoon} description={t.comingSoonDetail} className="mt-4" />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            <ToolsSearchGrid tools={tools} locale={locale} />
            <TopToolsSidebar tools={tools} locale={locale} />
          </div>
        )}
      </main>
    </div>
  );
}
