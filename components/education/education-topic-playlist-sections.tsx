import Image from "next/image";
import Link from "next/link";

import type { Lesson } from "@/lib/education/course";
import { getLessonThumbnailSrc, youtubeThumbnailFromEmbed } from "@/lib/education/course";
import type { Dictionary, Locale } from "@/lib/i18n";
import { cn } from "@/lib/ui/cn";

function episodeHref(locale: Locale, lessonSlug: string, episodeIndex: number) {
  return `/${locale}/education/${lessonSlug}?ep=${episodeIndex}`;
}

function episodeThumb(lesson: Lesson, videoIndex: number): string {
  const video = lesson.videos[videoIndex];
  if (!video) return getLessonThumbnailSrc(lesson);
  return youtubeThumbnailFromEmbed(video.embedUrl) || getLessonThumbnailSrc(lesson);
}

function episodeLabel(
  dict: Dictionary,
  videoTitle: string,
  episodeIndex: number,
): string {
  const numbered = dict.course.episodeLabel.replace("{n}", String(episodeIndex + 1));
  return videoTitle.trim() || numbered;
}

export function EducationTopicPlaylistSections({
  lessons,
  locale,
  dict,
  emptyMessage,
}: {
  lessons: Lesson[];
  locale: Locale;
  dict: Dictionary;
  emptyMessage: string;
}) {
  if (lessons.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-bridge/50 bg-surface py-20 text-center">
        <p className="text-sm text-ink-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {lessons.map((lesson) => {
        const playlistTitle = lesson.titles[locale];
        const countLabel = dict.course.lessonCount.replace(
          "{count}",
          String(lesson.videos.length),
        );

        return (
          <section
            key={lesson.slug}
            className="overflow-hidden rounded-2xl border border-bridge/40 bg-surface shadow-sm"
          >
            <div className="border-b border-bridge/40 bg-surface-soft/60 px-5 py-4">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">{playlistTitle}</h2>
              <p className="mt-1 text-sm text-ink-soft">{countLabel}</p>
            </div>

            <ul className="divide-y divide-bridge/30">
              {lesson.videos.map((video, index) => {
                const title = episodeLabel(
                  dict,
                  video.titles?.[locale] ?? "",
                  index,
                );
                const href = episodeHref(locale, lesson.slug, index);
                const thumb = episodeThumb(lesson, index);

                return (
                  <li key={`${lesson.slug}-${index}`}>
                    <Link
                      href={href}
                      className="group flex items-start gap-4 px-4 py-3 transition hover:bg-teal/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
                    >
                      <span className="mt-3 w-8 shrink-0 text-center text-xs font-bold tabular-nums text-ink-soft">
                        {dict.course.episodeLabel.replace("{n}", String(index + 1))}
                      </span>
                      <div className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-lg bg-slate-900">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt=""
                            fill
                            sizes="144px"
                            className="object-cover transition group-hover:scale-105"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1 py-1">
                        <p
                          className={cn(
                            "text-sm font-semibold leading-snug text-foreground transition group-hover:text-teal sm:text-base",
                          )}
                        >
                          {title}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-ink-soft">
                          {dict.course.openLesson}
                          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden>
                            <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
                          </svg>
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
