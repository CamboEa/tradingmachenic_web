import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
    <div className="min-h-screen bg-background">

      {/* Gold top accent line */}
      <div
        className="h-0.75"
        style={{
          background: "linear-gradient(to right, #629696 0%, rgba(212,175,55,0.4) 60%, transparent 100%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* ── Back nav ─────────────────────────────────────────── */}
        <div className="py-7">
          <Link
            href={`/${locale}/podcast`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-gold"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
              aria-hidden
            >
              <path d="M10 3L5 8l5 5" />
            </svg>
            {t.backToList}
          </Link>
        </div>

        {/* ── Header: title left, thumbnail right ──────────────── */}
        <div className="grid items-center gap-10 pb-10 lg:grid-cols-[1fr_400px]">

          {/* Left — text */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#629696]" aria-hidden />
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#629696]">
                {t.episodeEyebrow}
              </p>
            </div>

            <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
              {title}
            </h1>

            {description ? (
              <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft sm:text-lg">
                {description}
              </p>
            ) : null}
          </div>

          {/* Right — thumbnail card */}
        </div>

        {/* ── Divider ──────────────────────────────────────────── */}
        <div className="h-px bg-bridge/40" aria-hidden />

        {/* ── Player ───────────────────────────────────────────── */}
        <div className="py-10">
          <div className="overflow-hidden rounded-2xl bg-black shadow-[0_24px_64px_-12px_rgba(30,41,59,0.35)] ring-1 ring-slate-900/10">
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

      </div>
    </div>
  );
}
