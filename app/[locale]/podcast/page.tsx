import Link from "next/link";
import { notFound } from "next/navigation";

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
 className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[color-mix(in_oklab,#0ea5e9_30%,#cbd5e1)]"
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
 <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 via-white to-sky-50" />
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
 <h2 className="text-[1.0625rem] font-semibold leading-snug tracking-tight text-[#1e293b] transition-colors duration-200 group-hover:text-[#0ea5e9]">
 {title}
 </h2>
 {description ? (
 <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-500">{description}</p>
 ) : null}

 {/* CTA */}
 <div className="mt-5 flex items-center justify-end border-t border-slate-100 pt-4">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-[#0ea5e9] ring-1 ring-[color-mix(in_oklab,#0ea5e9_30%,transparent)] transition-all duration-200 group-hover:bg-[#0ea5e9] group-hover:text-white group-hover:ring-transparent">
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
 <section className="relative overflow-hidden bg-[#1e293b] px-4 py-16 sm:px-6 lg:px-8">
 <div
 className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(212,175,55,0.18),transparent_24rem),radial-gradient(circle_at_86%_10%,rgba(14,165,233,0.2),transparent_26rem)]"
 aria-hidden
 />
 <div className="relative mx-auto max-w-7xl">
 <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d4af37]">{t.eyebrow}</p>
 <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
 {t.title}
 </h1>
 <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">{t.intro}</p>
 </div>
 </section>

 <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
 {episodes.length === 0 ? (
 <div className="mt-4 rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/5 px-8 py-14 text-center">
 <p className="text-2xl font-bold text-[#1e293b]">{t.emptyTitle}</p>
 <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-slate-500">{t.emptyBody}</p>
 </div>
 ) : (
 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
 {episodes.map((ep, i) => (
 <EpisodeCard key={ep.id} episode={ep} index={i} locale={locale} watchLabel={t.openEpisode} />
 ))}
 </div>
 )}
 </main>
 </div>
 );
}
