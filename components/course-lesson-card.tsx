import Image from "next/image";
import Link from "next/link";

import type { Lesson } from "@/lib/course";
import { getLessonThumbnailSrc, lessonVideoCount } from "@/lib/course";
import type { Dictionary, Locale } from "@/lib/i18n";

function formatLessonProgress(
  template: string,
  currentOneBased: number,
  total: number,
): string {
  const c = String(currentOneBased).padStart(2, "0");
  const t = String(total).padStart(2, "0");
  return template.replace("{current}", c).replace("{total}", t);
}

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
  const previewObjectives = lesson.objectives[locale].slice(0, 2);
  const progressLabel = formatLessonProgress(
    dict.course.lessonProgress,
    index + 1,
    total,
  );
  const videosLabel = dict.course.videosInLesson.replace(
    "{count}",
    String(lessonVideoCount(lesson)),
  );

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_70%,transparent)] bg-[var(--color-surface)] shadow-sm transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--color-teal)_35%,var(--color-bridge))] hover:shadow-lg">
      <Link href={href} className="group flex flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-[color-mix(in_oklab,var(--color-bridge)_35%,var(--color-surface))]">
          {thumbSrc ? (
            <Image
              src={thumbSrc}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              priority={index === 0}
            />
          ) : null}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color-mix(in_oklab,var(--color-ink)_55%,transparent)] via-transparent to-transparent"
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-1 bg-[var(--color-gold)]" aria-hidden />
          <span className="absolute right-3 top-3 rounded-md bg-[color-mix(in_oklab,var(--color-teal)_88%,transparent)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            {videosLabel}
          </span>
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
            <span className="rounded-md bg-[color-mix(in_oklab,var(--color-surface)_92%,transparent)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-ink)] backdrop-blur-sm">
              {progressLabel}
            </span>
            <span className="rounded-md bg-[color-mix(in_oklab,var(--color-ink)_72%,transparent)] px-2.5 py-1 text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm">
              {lesson.approximateMinutes} min
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col border-t border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] p-5 sm:p-6">
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-[var(--color-ink)] transition-colors group-hover:text-[color-mix(in_oklab,var(--color-teal)_78%,var(--color-ink))]">
            {title}
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
            {summary}
          </p>

          <div className="mt-5 flex-1 border-t border-[color-mix(in_oklab,var(--color-bridge)_45%,transparent)] pt-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-gold)]">
              {dict.course.keyOutcomes}
            </p>
            <ul className="mt-3 space-y-2">
              {previewObjectives.map((item) => (
                <li
                  key={item}
                  className="flex gap-2 text-sm leading-snug text-[var(--color-ink-muted)]"
                >
                  <span
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--color-gold)]"
                    aria-hidden
                  />
                  <span className="line-clamp-2">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-[color-mix(in_oklab,var(--color-bridge)_45%,transparent)] pt-5">
            <span className="text-xs font-medium text-[var(--color-ink-soft)]">
              {dict.course.durationLabel}{" "}
              <span className="tabular-nums text-[var(--color-ink-muted)]">
                {lesson.approximateMinutes} min
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-teal)] transition group-hover:gap-2">
              {dict.course.openLesson}
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
