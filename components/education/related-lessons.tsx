import Link from "next/link";

import type { Lesson } from "@/lib/course";
import type { Locale } from "@/lib/i18n";

export function RelatedLessons({
 lessons,
 locale,
 title,
}: {
 lessons: Lesson[];
 locale: Locale;
 title: string;
}) {
 if (lessons.length === 0) return null;

 return (
 <section className="mt-14 max-w-4xl">
 <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
 {title}
 </h2>
 <ul className="mt-4 space-y-2">
 {lessons.map((lesson) => (
 <li key={lesson.slug}>
 <Link
 href={`/${locale}/education/${lesson.slug}`}
 className="flex items-center justify-between gap-3 rounded-xl border border-bridge/30 bg-surface/88 px-4 py-3 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]"
 >
 <span className="line-clamp-1">{lesson.titles[locale]}</span>
 <span className="shrink-0 text-[var(--color-teal)]" aria-hidden>
 →
 </span>
 </Link>
 </li>
 ))}
 </ul>
 </section>
 );
}
