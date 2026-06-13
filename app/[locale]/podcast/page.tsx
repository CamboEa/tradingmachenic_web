import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState, PublicPageHero, PublicPageMain } from "@/components/ui";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getPublishedPodcasts } from "@/lib/supabase/podcasts";
import { extractYouTubeVideoId, youtubeThumbnailUrl } from "@/lib/youtube";

export const dynamic = "force-dynamic";

function EpisodeCard({
 episode,
 index,
 locale,
 watchLabel,
}: {
 episode: Awaited<ReturnType<typeof getPublishedPodcasts>>[number];
 index: number;
 locale: Locale;
 watchLabel: string;
}) {
 const title = locale === "km" ? episode.title_km : episode.title_en;
 const description = locale === "km" ? episode.description_km : episode.description_en;
 const vid = extractYouTubeVideoId(episode.youtube_url);
 const thumb = vid ? youtubeThumbnailUrl(vid) : null;

 return (
 <Link
 href={`/${locale}/podcast/${episode.id}`}
 className="ui-content-card group relative flex flex-col overflow-hidden"
 aria-label={title}
 >
 {/* Gold top accent */}
 <div className="absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-[#d4af37] via-[#d4af37]/70 to-transparent" aria-hidden />

 {/* Thumbnail */}
 <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
 {thumb ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img
 src={thumb}
 alt=""
 className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
 />
 ) : (
 <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 via-white to-[#EFF6FF]" />
 )}
 <div className="absolute inset-0 bg-linear-to-t from-[#0f172a]/65 via-[#0f172a]/10 to-transparent" aria-hidden />

 {/* Play button */}
 <div className="absolute inset-0 flex items-center justify-center">
 <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 backdrop-blur-sm transition duration-300 group-hover:bg-white/30 group-hover:scale-110">
 <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 translate-x-0.5 text-white" aria-hidden>
 <polygon points="4,2 18,10 4,18" />
 </svg>
 </span>
 </div>

 {/* Episode number — bottom left */}
 <div className="absolute bottom-3 left-4 flex items-end gap-1.5">
 <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">EP</span>
 <span className="font-black leading-none tabular-nums text-white" style={{ fontSize: "1.75rem" }}>
 {String(index + 1).padStart(2, "0")}
 </span>
 </div>

 {/* YouTube badge — bottom right */}
 <span className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
 YouTube
 </span>
 </div>

 {/* Body */}
 <div className="flex flex-1 flex-col p-5 sm:p-6">
 <h2 className="text-[1.0625rem] font-semibold leading-snug tracking-tight text-[#1e293b] transition-colors duration-200 group-hover:text-[#2563EB]">
 {title}
 </h2>
 {description ? (
 <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-500">{description}</p>
 ) : null}

 {/* CTA */}
 <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-4">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#2563EB] ring-1 ring-[color-mix(in_oklab,#2563EB_30%,transparent)] transition-all duration-200 group-hover:bg-[#2563EB] group-hover:text-white group-hover:ring-transparent">
 {watchLabel}
 <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
 </span>
 </div>
 </div>
 </Link>
 );
}

export default async function PodcastIndexPage({ params }: { params: Promise<{ locale: string }> }) {
 const { locale: raw } = await params;
 if (!isLocale(raw)) notFound();
 const locale = raw as Locale;
 const dict = await getDictionary(locale);
 const t = dict.podcastPage;
 const episodes = await getPublishedPodcasts();

 return (
 <div className="flex flex-col">
 <PublicPageHero eyebrow={t.eyebrow} title={t.title} description={t.intro} />
 <PublicPageMain>
 {episodes.length === 0 ? (
 <EmptyState title={t.emptyTitle} description={t.emptyBody} className="mt-4" />
 ) : (
 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
 {episodes.map((ep, i) => (
 <EpisodeCard key={ep.id} episode={ep} index={i} locale={locale} watchLabel={t.openEpisode} />
 ))}
 </div>
 )}
 </PublicPageMain>
 </div>
 );
}
