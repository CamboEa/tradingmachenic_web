"use client";

import { useState } from "react";

import type { LessonVideo } from "@/lib/course";
import type { Locale } from "@/lib/i18n";

interface LessonPlayerProps {
  videos: LessonVideo[];
  locale: Locale;
  lessonTitle: string;
  videoInLessonHeading: string;
}

function formatHeading(template: string, current: number, total: number) {
  return template
    .replace("{current}", String(current))
    .replace("{total}", String(total));
}

export function LessonPlayer({
  videos,
  locale,
  lessonTitle,
  videoInLessonHeading,
}: LessonPlayerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeVideo = videos[activeIndex];
  const total = videos.length;

  const activeTitle =
    activeVideo.titles?.[locale] ??
    formatHeading(videoInLessonHeading, activeIndex + 1, total);

  return (
    <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Main player — left column */}
      <div className="min-w-0 flex-1">
        <h2 className="mb-4 text-base font-semibold tracking-tight text-[var(--color-ink)]">
          {activeTitle}
        </h2>
        <div className="overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_65%,transparent)] bg-black shadow-lg">
          <div className="aspect-video w-full">
            <iframe
              key={activeIndex}
              title={`${lessonTitle} — ${activeTitle}`}
              src={activeVideo.embedUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      {/* Video list — right column */}
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
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition",
                    isActive
                      ? "border-[var(--color-teal)] bg-[color-mix(in_oklab,var(--color-teal)_8%,var(--color-surface))] text-[var(--color-teal)]"
                      : "border-[color-mix(in_oklab,var(--color-bridge)_65%,transparent)] bg-[var(--color-surface)] text-[var(--color-ink-muted)] hover:border-[color-mix(in_oklab,var(--color-teal)_40%,transparent)] hover:text-[var(--color-ink)]",
                  ].join(" ")}
                >
                  {/* Index bubble */}
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
                  <span className="line-clamp-2 text-sm font-medium leading-snug">
                    {title}
                  </span>
                  {/* Playing indicator */}
                  {isActive && (
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
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
