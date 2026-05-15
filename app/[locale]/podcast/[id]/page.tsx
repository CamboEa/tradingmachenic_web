import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getPublishedPodcastById } from "@/lib/supabase/podcasts";
import { extractYouTubeVideoId, youtubeEmbedSrc, youtubeWatchUrl } from "@/lib/youtube";

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
  const watchHref = youtubeWatchUrl(vid);

  return (
    <div className="flex flex-col">
      <section className="border-b border-slate-200/80 bg-white/90 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href={`/${locale}/podcast`}
            className="text-sm font-semibold text-[#0ea5e9] transition hover:text-sky-700"
          >
            ← {t.backToList}
          </Link>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#d4af37]">{t.episodeEyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1e293b] sm:text-4xl">{title}</h1>
          {description ? (
            <p className="mt-4 text-base leading-relaxed text-slate-600">{description}</p>
          ) : null}
          <p className="mt-4">
            <a
              href={watchHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
            >
              {t.watchOnYouTube}
              <span aria-hidden>↗</span>
            </a>
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-900/10 bg-black shadow-2xl shadow-slate-900/18">
          <div className="aspect-video w-full">
            <iframe
              title={title}
              src={embedSrc}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </main>
    </div>
  );
}
