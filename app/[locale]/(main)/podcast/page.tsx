import { notFound } from "next/navigation";

import { EmptyState, PublicPageHero, PublicPageMain } from "@/components/ui";
import { PodcastSearchGrid } from "@/components/podcast/podcast-search-grid";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getPublishedPodcasts } from "@/lib/supabase/podcasts";

export const dynamic = "force-dynamic";

export default async function PodcastIndexPage({ params }: { params: Promise<{ locale: string }> }) {
 const { locale: raw } = await params;
 if (!isLocale(raw)) notFound();
 const locale = raw as Locale;
 const dict = await getDictionary(locale);
 const t = dict.podcastPage;
 const episodes = await getPublishedPodcasts();

 return (
  <div className="flex flex-col">
   <PublicPageHero eyebrow={t.eyebrow} title={t.title} description={t.intro} backgroundImage="/Images/bg-podcast-header.png" />
   <PublicPageMain>
    {episodes.length === 0 ? (
     <EmptyState title={t.emptyTitle} description={t.emptyBody} className="mt-4" />
    ) : (
     <PodcastSearchGrid episodes={episodes} locale={locale} watchLabel={t.openEpisode} />
    )}
   </PublicPageMain>
  </div>
 );
}
