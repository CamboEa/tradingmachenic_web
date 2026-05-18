"use client";

import { useState } from "react";

import type { LessonVideo } from "@/lib/course";
import type { Locale } from "@/lib/i18n";
import {
  isDirectVideoFileUrl,
  isYouTubeVideoUrl,
  resolveLessonVideoEmbedUrl,
} from "@/lib/video";

interface LessonPlayerProps {
  videos: LessonVideo[];
  locale: Locale;
  lessonTitle: string;
  videoInLessonHeading: string;
  paidVideoHint?: string;
}

function formatHeading(template: string, current: number, total: number) {
  return template
    .replace("{current}", String(current))
    .replace("{total}", String(total));
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
  videos,
  locale,
  lessonTitle,
  videoInLessonHeading,
  paidVideoHint,
}: LessonPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVideo = videos[activeIndex];
  const total = videos.length;

  const activeTitle =
    activeVideo.titles?.[locale] ??
    formatHeading(videoInLessonHeading, activeIndex + 1, total);

  const rawUrl = activeVideo.embedUrl;
  const isDirect = isDirectVideoFileUrl(rawUrl);
  const playbackSrc = isDirect ? rawUrl.trim() : resolveLessonVideoEmbedUrl(rawUrl);
  const showPaidHint = paidVideoHint && isDirect && !isYouTubeVideoUrl(rawUrl);

  return (
    <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-1">
        <h2 className="mb-4 text-base font-semibold tracking-tight text-[var(--color-ink)]">
          {activeTitle}
        </h2>
        <div className="overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-black shadow-2xl shadow-slate-900/18">
          <div className="aspect-video w-full">
            <VideoSurface src={playbackSrc} title={`${lessonTitle} — ${activeTitle}`} isDirectFile={isDirect} />
          </div>
        </div>
        {showPaidHint ? (
          <p className="mt-3 text-xs leading-relaxed text-[var(--color-ink-soft)]">{paidVideoHint}</p>
        ) : null}
      </div>

      <aside className="w-full shrink-0 lg:w-72 xl:w-80">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-soft)]">
          {total} {total === 1 ? "video" : "videos"}
        </p>
        <ul className="space-y-2">
          {videos.map((video, index) => {
            const title =
              video.titles?.[locale] ??
              formatHeading(videoInLessonHeading, index + 1, total);
            const isActive = index === activeIndex;

            return (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={[
                    "flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left shadow-sm shadow-slate-900/5 transition",
                    isActive
                      ? "border-[var(--color-teal)] bg-[color-mix(in_oklab,var(--color-teal)_8%,var(--color-surface))] text-[var(--color-teal)]"
                      : "border-[color-mix(in_oklab,var(--color-bridge)_65%,transparent)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:border-[color-mix(in_oklab,var(--color-teal)_40%,transparent)] hover:text-[var(--color-ink)]",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isActive
                        ? "bg-[var(--color-teal)] text-white"
                        : "bg-[color-mix(in_oklab,var(--color-bridge)_50%,transparent)] text-[var(--color-ink-soft)]",
                    ].join(" ")}
                  >
                    {index + 1}
                  </span>
                  <span className="line-clamp-2 text-sm font-medium leading-snug">{title}</span>
                  {isActive ? (
                    <span className="ml-auto shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path d="M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.268a1.5 1.5 0 0 1 0 2.53L5.305 13.533A1.5 1.5 0 0 1 3 12.268V3.732Z" />
                      </svg>
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
