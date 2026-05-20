import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonPlayer } from "@/components/lesson-player";
import { MarkLessonComplete } from "@/components/mark-lesson-complete";
import { RelatedLessons } from "@/components/related-lessons";
import { getAllLessons, getLessonBySlug } from "@/lib/supabase/lessons";
import { getCompletedLessonSlugs } from "@/lib/supabase/lesson-progress";
import { getSessionUser } from "@/lib/supabase/server";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { isDirectVideoFileUrl } from "@/lib/video";

export async function generateStaticParams() {
  const paths: { locale: Locale; slug: string }[] = [];
  const lessons = await getAllLessons();
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
  const lesson = await getLessonBySlug(slug);
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
  const [dict, allLessons] = await Promise.all([
    getDictionary(locale),
    getAllLessons(),
  ]);

  const lesson = allLessons.find((l) => l.slug === slug);
  if (!lesson) notFound();

  const index = allLessons.findIndex((l) => l.slug === slug);
  const related = allLessons.filter((_, i) => i > index).slice(0, 3);

  const user = await getSessionUser();
  const completedSlugs = user ? await getCompletedLessonSlugs(user.id) : [];
  const isCompleted = completedSlugs.includes(slug);

  const showHostedHint =
    lesson.type === "paid" ||
    lesson.videos.some((v) => isDirectVideoFileUrl(v.embedUrl));

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <p className="text-sm">
        <Link
          href={`/${locale}/education`}
          className="font-semibold text-[#0ea5e9] transition hover:text-sky-700"
        >
          ← {dict.course.backToCourse}
        </Link>
      </p>

      <header className="mt-6 max-w-4xl rounded-[2rem] border border-white/80 bg-white/78 p-6 shadow-sm shadow-slate-900/5 backdrop-blur sm:p-8">
        <h1 className="text-3xl font-semibold tracking-[-0.025em] text-[var(--color-ink)] sm:text-5xl">
          {lesson.titles[locale]}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--color-ink-muted)]">
          {lesson.summaries[locale]}
        </p>
      </header>

      <LessonPlayer
        videos={lesson.videos}
        locale={locale}
        lessonTitle={lesson.titles[locale]}
        videoInLessonHeading={dict.course.videoInLessonHeading}
        paidVideoHint={showHostedHint ? dict.course.paidVideoHint : undefined}
      />

      {showHostedHint ? (
        <p className="mt-2 text-xs text-[var(--color-ink-soft)]">{dict.course.videoFallback}</p>
      ) : null}

      <MarkLessonComplete
        slug={slug}
        locale={locale}
        initialCompleted={isCompleted}
        completedLabel={dict.course.lessonCompleted}
        markCompleteLabel={dict.course.markComplete}
        signInHint={dict.course.signInToTrackProgress}
      />

      <section className="mt-10 max-w-4xl rounded-[1.5rem] border border-white/80 bg-white/88 p-6 shadow-sm shadow-slate-900/5 backdrop-blur">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
          {dict.course.objectives}
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--color-ink-muted)]">
          {lesson.objectives[locale].map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <RelatedLessons lessons={related} locale={locale} title={dict.course.relatedLessons} />
    </main>
  );
}
