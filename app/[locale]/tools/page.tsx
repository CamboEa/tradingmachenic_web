import { notFound } from "next/navigation";

import { EmptyState, PublicPageHero, PublicPageMain } from "@/components/ui";
import { ToolsSearchGrid } from "@/components/tools/tools-search-grid";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getPublishedTools } from "@/lib/supabase/tools";

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

  const tools = await getPublishedTools();

  return (
    <div className="flex flex-col">
      <PublicPageHero eyebrow={t.eyebrow} title={t.title} description={t.intro} />
      <PublicPageMain>
        {tools.length === 0 ? (
          <EmptyState title={t.comingSoon} description={t.comingSoonDetail} className="mt-4" />
        ) : (
          <ToolsSearchGrid tools={tools} locale={locale} />
        )}
      </PublicPageMain>
    </div>
  );
}
