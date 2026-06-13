import Image from "next/image";
import Link from "next/link";

import type { Lesson } from "@/lib/course";
import { getLessonThumbnailSrc, lessonVideoCount } from "@/lib/course";
import type { Dictionary, Locale } from "@/lib/i18n";

export function CourseLessonCard({
  lesson,
  locale,
  index,
  total,
  dict,
}: {
  lesson: Lesson;
  locale: Locale;
  index: number;
  total: number;
  dict: Dictionary;
}) {
  const href = `/${locale}/education/${lesson.slug}`;
  const thumbSrc = getLessonThumbnailSrc(lesson);
  const title = lesson.titles[locale];
  const summary = lesson.summaries[locale];
  const videoCount = lessonVideoCount(lesson);

  return (
    <article className="ui-content-card group relative flex h-full flex-col overflow-hidden">
      {/* Gold top accent */}
      <div
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[var(--color-gold)] via-[var(--color-gold)]/70 to-transparent"
        aria-hidden
      />

      <Link
        href={href}
        className="flex flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-slate-100">
          {thumbSrc ? (
            <Image
              src={thumbSrc}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              priority={index === 0}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
          )}

          {/* Dark gradient overlay */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f172a]/70 via-[#0f172a]/10 to-transparent"
            aria-hidden
          />

          {/* Lesson number — bottom left */}
          <div className="absolute bottom-3 left-4 flex items-end gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
              {dict.course.lessonProgress.split("{current}")[0].trim() || "Lesson"}
            </span>
            <span className="font-black leading-none text-white tabular-nums" style={{ fontSize: "1.75rem" }}>
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          {/* Badges — top right */}
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            {videoCount > 0 && (
              <span className="flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                <svg width="8" height="9" viewBox="0 0 8 9" fill="currentColor" aria-hidden>
                  <polygon points="0,0.5 8,4.5 0,8.5" />
                </svg>
                {videoCount}
              </span>
            )}
            {lesson.type && (
              <span
                className={[
                  "rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm",
                  lesson.type === "free"
                    ? "bg-[var(--color-teal)]/85 text-white"
                    : "bg-[var(--color-gold)]/90 text-[#0f172a]",
                ].join(" ")}
              >
                {lesson.type === "free" ? dict.course.filterFree : dict.course.filterPaid}
              </span>
            )}
          </div>

          {/* Duration — bottom right */}
          <span className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
            {lesson.approximateMinutes} min
          </span>
        </div>

        {/* Card body */}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="text-[1.0625rem] font-semibold leading-snug tracking-tight text-[var(--color-ink)] transition-colors duration-200 group-hover:text-[var(--color-teal)]">
            {title}
          </h3>
          <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-[var(--color-ink-muted)]">
            {summary}
          </p>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs font-medium tabular-nums text-[var(--color-ink-soft)]">
              {String(index + 1).padStart(2, "0")}
              <span className="mx-1 opacity-40">/</span>
              {String(total).padStart(2, "0")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-[var(--color-teal)] ring-1 ring-[color-mix(in_oklab,var(--color-teal)_30%,transparent)] transition-all duration-200 group-hover:bg-[var(--color-teal)] group-hover:text-white group-hover:ring-transparent">
              {dict.course.openLesson}
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
