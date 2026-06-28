"use client";

import Link from "next/link";
import { useState } from "react";

import type { Lesson, LessonVideo } from "@/lib/course";
import { youtubeThumbnailFromEmbed } from "@/lib/course";
import type { Locale } from "@/lib/i18n";
import {
  isDirectVideoFileUrl,
  isYouTubeVideoUrl,
  resolveLessonVideoEmbedUrl,
} from "@/lib/video";
import { cn } from "@/lib/ui/cn";

interface LessonStrings {
  videoInLessonHeading: string;
  objectives: string;
  /** "{count} videos" */
  videosInLesson: string;
  episodeLabel: string;
  episodesInPlaylist: string;
  relatedLessons?: string;
  paidVideoHint?: string;
  videoFallback?: string;
}

interface LessonPlayerProps {
  lesson: Lesson;
  locale: Locale;
  t: LessonStrings;
  initialVideoIndex?: number;
  relatedLessons?: Lesson[];
}

function formatHeading(template: string, current: number, total: number) {
  return template.replace("{current}", String(current)).replace("{total}", String(total));
}

function formatCount(template: string, count: number) {
  return template.replace("{count}", String(count));
}

function formatEpisode(template: string, episode: number) {
  return template.replace("{n}", String(episode));
}

function clampIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(Math.max(0, index), total - 1);
}

function videoThumb(lesson: Lesson, video: LessonVideo): string {
  return youtubeThumbnailFromEmbed(video.embedUrl) || lesson.thumbnailUrl || "";
}

function episodeTitle(
  video: LessonVideo,
  locale: Locale,
  t: LessonStrings,
  index: number,
  total: number,
) {
  const custom = video.titles?.[locale]?.trim();
  if (custom) return custom;
  return formatHeading(t.videoInLessonHeading, index + 1, total);
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.268a1.5 1.5 0 0 1 0 2.53L5.305 13.533A1.5 1.5 0 0 1 3 12.268V3.732Z" />
    </svg>
  );
}

function ThumbBox({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn("relative aspect-video shrink-0 overflow-hidden rounded-lg bg-slate-900", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white/40">
          <PlayIcon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

function VideoSurface({
  src,
  title,
  isDirectFile,
}: {
  src: string;
  title: string;
  isDirectFile: boolean;
}) {
  if (isDirectFile) {
    return (
      <video
        key={src}
        src={src}
        controls
        playsInline
        preload="metadata"
        className="h-full w-full bg-black object-contain"
        title={title}
      >
        <track kind="captions" />
      </video>
    );
  }

  return (
    <iframe
      key={src}
      title={title}
      src={src}
      className="h-full w-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
    />
  );
}

export function LessonPlayer({
  lesson,
  locale,
  t,
  initialVideoIndex = 0,
  relatedLessons,
}: LessonPlayerProps) {
  const videos = lesson.videos;
  const total = videos.length;
  const [activeIndex, setActiveIndex] = useState(() =>
    clampIndex(initialVideoIndex, total),
  );
  const [descOpen, setDescOpen] = useState(false);

  const activeVideo = videos[activeIndex];
  const activeTitle = episodeTitle(activeVideo, locale, t, activeIndex, total);

  const rawUrl = activeVideo.embedUrl;
  const isDirect = isDirectVideoFileUrl(rawUrl);
  const playbackSrc = isDirect ? rawUrl.trim() : resolveLessonVideoEmbedUrl(rawUrl);
  const showPaidHint = t.paidVideoHint && isDirect && !isYouTubeVideoUrl(rawUrl);

  const objectives = lesson.objectives[locale];
  const summary = lesson.summaries[locale];
  const isPaid = lesson.type === "paid";
  const durationLine = locale === "km" ? `${lesson.approximateMinutes} នាទី` : `${lesson.approximateMinutes} min`;
  const metaLine = `${formatCount(t.videosInLesson, total)} · ~${durationLine}`;
  const toggleLabel = descOpen
    ? (locale === "km" ? "បង្ហាញតិច" : "Show less")
    : (locale === "km" ? "…មើលបន្ថែម" : "…more");

  const hasSidebar = total > 1;

  return (
    <div className={cn(
      "grid gap-x-6 gap-y-8",
      hasSidebar ? "lg:grid-cols-[minmax(0,1fr)_388px]" : "lg:max-w-4xl lg:mx-auto"
    )}>
      {/* Main column */}
      <div className="min-w-0">
        <div className="overflow-hidden rounded-2xl border border-bridge/30 bg-black shadow-lg">
          <div className="aspect-video w-full">
            <VideoSurface
              src={playbackSrc}
              title={`${lesson.titles[locale]} — ${activeTitle}`}
              isDirectFile={isDirect}
            />
          </div>
        </div>

        <h1 className="mt-4 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {total > 1 ? activeTitle : lesson.titles[locale]}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-muted">
          {total > 1 ? (
            <span className="font-medium">
              {formatEpisode(t.episodeLabel, activeIndex + 1)}
            </span>
          ) : null}
          <span className="font-medium">{metaLine}</span>
        </div>

        <div className="mt-4 rounded-2xl border border-bridge/30 bg-surface-soft/40 p-5">
          <p className="text-sm font-semibold text-foreground">{lesson.titles[locale]}</p>
          <p
            className={cn(
              "mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-muted",
              !descOpen && "line-clamp-2",
            )}
          >
            {summary}
          </p>

          {descOpen && objectives.length > 0 ? (
            <div className="mt-4 border-t border-bridge/25 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {t.objectives}
              </p>
              <ul className="mt-3 space-y-2">
                {objectives.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm leading-snug text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {objectives.length > 0 || (summary?.length ?? 0) > 120 ? (
            <button
              type="button"
              onClick={() => setDescOpen((v) => !v)}
              className="mt-3 text-sm font-semibold text-teal hover:text-sky-600 transition"
            >
              {toggleLabel}
            </button>
          ) : null}
        </div>

        {showPaidHint ? (
          <p className="mt-3 text-xs leading-relaxed text-ink-soft">{t.paidVideoHint}</p>
        ) : t.videoFallback ? (
          <p className="mt-3 text-xs leading-relaxed text-ink-soft">{t.videoFallback}</p>
        ) : null}

        {/* Related Lessons placed below description */}
        {relatedLessons && relatedLessons.length > 0 ? (
          <div className="mt-8 rounded-2xl border border-bridge/40 bg-surface shadow-sm">
            <p className="border-b border-bridge/30 px-4 py-3 text-sm font-bold text-foreground">
              {t.relatedLessons ?? "Continue Learning"}
            </p>
            <ul className="divide-y divide-bridge/20 p-2">
              {relatedLessons.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/${locale}/education/${l.slug}`}
                    className="group block rounded-xl p-3 hover:bg-surface-soft/60 transition"
                  >
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-teal">
                      {l.category}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-foreground group-hover:text-teal transition-colors">
                      {l.titles[locale]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Sidebar playlist & related content */}
      {hasSidebar && (
        <aside className="min-w-0 space-y-6">
          <div className="rounded-2xl border border-bridge/40 bg-surface shadow-sm">
            <p className="border-b border-bridge/30 px-4 py-3 text-sm font-bold text-foreground">
              {t.episodesInPlaylist}
            </p>
            <ul className="max-h-160 overflow-y-auto p-2">
              {videos.map((video, index) => {
                const title = episodeTitle(video, locale, t, index, total);
                const isActive = index === activeIndex;
                return (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "flex w-full cursor-pointer items-start gap-3 rounded-xl p-2 text-left transition",
                        isActive ? "bg-teal/10" : "hover:bg-surface-soft/60",
                      )}
                    >
                      <span className="w-7 shrink-0 pt-8 text-center text-xs font-bold tabular-nums text-ink-soft">
                        {formatEpisode(t.episodeLabel, index + 1)}
                      </span>
                      <div className="relative">
                        <ThumbBox src={videoThumb(lesson, video)} alt={title} className="w-32" />
                        {isActive ? (
                          <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/45 text-white">
                            <PlayIcon className="h-5 w-5" />
                          </span>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <span
                          className={cn(
                            "block line-clamp-3 text-sm font-semibold leading-snug",
                            isActive ? "text-teal" : "text-foreground",
                          )}
                        >
                          {title}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      )}
    </div>
  );
}
