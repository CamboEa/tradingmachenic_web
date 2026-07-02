"use client";

import { useState } from "react";

import type { BlogVideoItem } from "@/lib/supabase/blog-videos";
import type { Locale } from "@/lib/i18n";
import {
  isDirectVideoFileUrl,
  resolveLessonVideoEmbedUrl,
} from "@/lib/media/video";

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
      />
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

export function BlogVideoPlayer({
  videos,
  locale,
  articleTitle,
  videoHeading,
}: {
  videos: BlogVideoItem[];
  locale: Locale;
  articleTitle: string;
  videoHeading: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (videos.length === 0) return null;

  const active = videos[activeIndex];
  const total = videos.length;
  const activeTitle =
    (locale === "km" ? active.title_km?.trim() || active.title_en : active.title_en) ||
    `${videoHeading} ${activeIndex + 1}`;

  const rawUrl = active.url;
  const isDirect = active.source === "upload" || isDirectVideoFileUrl(rawUrl);
  const playbackSrc = isDirect ? rawUrl.trim() : resolveLessonVideoEmbedUrl(rawUrl);

  return (
    <section className="mb-10">
      <h2 className="mb-4 text-base font-semibold tracking-tight text-foreground">{videoHeading}</h2>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <p className="mb-3 text-sm font-medium text-ink-muted">{activeTitle}</p>
          <div className="overflow-hidden rounded-2xl border border-bridge/40 bg-black shadow-lg shadow-black/30">
            <div className="aspect-video w-full">
              <VideoSurface
                src={playbackSrc}
                title={`${articleTitle} — ${activeTitle}`}
                isDirectFile={isDirect}
              />
            </div>
          </div>
        </div>

        {total > 1 ? (
          <aside className="w-full shrink-0 lg:w-64">
            <ul className="space-y-2">
              {videos.map((video, index) => {
                const title =
                  (locale === "km" ? video.title_km?.trim() || video.title_en : video.title_en) ||
                  `${videoHeading} ${index + 1}`;
                const isActive = index === activeIndex;
                return (
                  <li key={`${video.url}-${index}`}>
                    <button
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={[
                        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition",
                        isActive
                          ? "border-gold bg-surface-soft text-foreground"
                          : "border-bridge/40 bg-surface text-ink-muted hover:border-gold/30",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                          isActive ? "bg-teal text-white" : "bg-surface-soft text-ink-soft",
                        ].join(" ")}
                      >
                        {index + 1}
                      </span>
                      <span className="line-clamp-2 font-medium">{title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
