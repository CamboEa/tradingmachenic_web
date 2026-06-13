"use client";

import { useState } from "react";
import Link from "next/link";

import type { Locale } from "@/lib/i18n";
import type { Podcast } from "@/lib/supabase/podcasts";
import { extractYouTubeVideoId, youtubeThumbnailUrl } from "@/lib/youtube";

function EpisodeCard({
  episode,
  index,
  locale,
  watchLabel,
}: {
  episode: Podcast;
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
      aria-label={title ?? ""}
    >
      <div className="absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-[#d4af37] via-[#d4af37]/70 to-transparent" aria-hidden />

      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 via-white to-[#EFF6FF]" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-[#0f172a]/65 via-[#0f172a]/10 to-transparent" aria-hidden />

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40 backdrop-blur-sm transition duration-300 group-hover:bg-white/30 group-hover:scale-110">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 translate-x-0.5 text-white" aria-hidden>
              <polygon points="4,2 18,10 4,18" />
            </svg>
          </span>
        </div>

        <div className="absolute bottom-3 left-4 flex items-end gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">EP</span>
          <span className="font-black leading-none tabular-nums text-white" style={{ fontSize: "1.75rem" }}>
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <span className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold text-white/90 backdrop-blur-sm">
          YouTube
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h2 className="text-[1.0625rem] font-semibold leading-snug tracking-tight text-[#1e293b] transition-colors duration-200 group-hover:text-[#2563EB]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-slate-500">{description}</p>
        ) : null}

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

export function PodcastSearchGrid({
  episodes,
  locale,
  watchLabel,
  emptySearchLabel,
}: {
  episodes: Podcast[];
  locale: Locale;
  watchLabel: string;
  emptySearchLabel?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = query.trim()
    ? episodes.filter((ep) => {
        const q = query.toLowerCase();
        return (
          ep.title_en.toLowerCase().includes(q) ||
          ep.title_km?.toLowerCase().includes(q) ||
          ep.description_en?.toLowerCase().includes(q) ||
          ep.description_km?.toLowerCase().includes(q)
        );
      })
    : episodes;

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        >
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
        </svg>
        <input
          type="search"
          placeholder="Search episodes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 shadow-sm transition focus:border-[#2563EB]/50 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-20 text-center">
          <p className="text-sm font-medium text-slate-400">
            {emptySearchLabel ?? `No episodes match "${query}".`}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ep, i) => (
            <EpisodeCard key={ep.id} episode={ep} index={i} locale={locale} watchLabel={watchLabel} />
          ))}
        </div>
      )}
    </div>
  );
}
