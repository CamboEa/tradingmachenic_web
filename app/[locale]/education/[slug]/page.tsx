import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonPlayer } from "@/components/lesson-player";
import { getLessonBySlug, lessons } from "@/lib/course";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateStaticParams() {
  const paths: { locale: Locale; slug: string }[] = [];
  for (const locale of ["km", "en"] as const) {
    for (const lesson of lessons) {
      paths.push({ locale, slug: lesson.slug });
    }
  }
  return paths;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const lesson = getLessonBySlug(slug);
  if (!lesson) return {};
  return {
    title: lesson.titles[locale],
    description: lesson.summaries[locale],
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">  
      <header className="mt-6 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
          {lesson.titles[locale]}
        </h1>
        <p className="mt-4 text-lg text-[var(--color-ink-muted)]">
          {lesson.summaries[locale]}
        </p>
      </header>

      <LessonPlayer
        videos={lesson.videos}
        locale={locale}
        lessonTitle={lesson.titles[locale]}
        videoInLessonHeading={dict.course.videoInLessonHeading}
      />

      <p className="mt-6 text-xs text-[var(--color-ink-soft)]">
        {dict.course.videoFallback}
      </p>

      <section className="mt-10 max-w-3xl rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_65%,transparent)] bg-[var(--color-surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
          {dict.course.objectives}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--color-ink-muted)]">
          {lesson.objectives[locale].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
