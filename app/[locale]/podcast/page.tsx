import Link from "next/link";
import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getPublishedPodcasts } from "@/lib/supabase/podcasts";
import { extractYouTubeVideoId, youtubeThumbnailUrl } from "@/lib/youtube";

export const dynamic = "force-dynamic";

function EpisodeCard({
  episode,
  locale,
  watchLabel,
}: {
  episode: Awaited<ReturnType<typeof getPublishedPodcasts>>[number];
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
      className="group flex flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/88 shadow-sm shadow-slate-900/5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-2xl hover:shadow-slate-900/10"
      aria-label={title}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 via-white to-sky-50 text-4xl text-slate-300">
            ▶
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
          YouTube
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-bold leading-snug text-[#1e293b] transition-colors group-hover:text-[#0ea5e9]">{title}</h2>
        {description ? (
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-slate-500">{description}</p>
        ) : (
          <p className="mt-2.5 text-sm italic text-slate-300">—</p>
        )}
        <div className="my-4 h-px bg-slate-100" />
        <span className="mt-auto text-xs font-semibold text-[#0ea5e9] transition group-hover:translate-x-0.5">
          {watchLabel} →
        </span>
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
            {episodes.map((ep) => (
              <EpisodeCard key={ep.id} episode={ep} locale={locale} watchLabel={t.openEpisode} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
