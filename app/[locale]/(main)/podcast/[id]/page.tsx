import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PublicPageHero, PublicPageMain } from "@/components/ui";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getPublishedPodcastById } from "@/lib/supabase/podcasts";
import { extractYouTubeVideoId, youtubeEmbedSrc, youtubeThumbnailUrl } from "@/lib/youtube";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) return { title: "Podcast" };
  const locale = raw as Locale;
  const ep = await getPublishedPodcastById(id);
  if (!ep) return { title: "Podcast" };
  const title = locale === "km" ? ep.title_km : ep.title_en;
  return { title: `${title} · Podcast` };
}

export default async function PodcastEpisodePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: raw, id } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const t = dict.podcastPage;

  const episode = await getPublishedPodcastById(id);
  if (!episode) notFound();

  const title = locale === "km" ? episode.title_km : episode.title_en;
  const description = locale === "km" ? episode.description_km : episode.description_en;
  const vid = extractYouTubeVideoId(episode.youtube_url);
  if (!vid) notFound();

  const embedSrc = youtubeEmbedSrc(vid);
  const thumb = youtubeThumbnailUrl(vid);

  return (
    <div className="flex flex-col bg-background">
      <PublicPageHero
        title={title}
        backgroundImage="/Images/bg-podcast-header.png"
        panel={
          <div className="mx-auto w-full max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              <Link href={`/${locale}/podcast`} className="inline-flex items-center gap-1.5 text-white/80 transition hover:text-gold">
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden>
                  <path fillRule="evenodd" d="M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L6.06 8l3.72 3.72a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
                </svg>
                {t.backToList}
              </Link>
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="h-px w-8 bg-teal" aria-hidden />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold">
                {t.episodeEyebrow}
              </p>
            </div>

            <h1 className="mt-4 text-3xl font-black leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              {title}
            </h1>

            {description ? (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-100/90 sm:text-lg">
                {description}
              </p>
            ) : null}
          </div>
        }
      />

      <PublicPageMain className="pb-16 pt-10">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl bg-black shadow-[0_24px_64px_-12px_rgba(30,41,59,0.35)] border border-bridge/40 ring-1 ring-slate-900/10">
            <div className="aspect-video w-full">
              <iframe
                title={title}
                src={embedSrc}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ display: "block" }}
              />
            </div>
          </div>
        </div>
      </PublicPageMain>
    </div>
  );
}
