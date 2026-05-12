import { notFound } from "next/navigation";

import { CourseLessonCard } from "@/components/course-lesson-card";
import { Reveal } from "@/components/reveal";
import { getAllLessons } from "@/lib/supabase/lessons";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function EducationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const lessons = await getAllLessons();
  const total = lessons.length;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Reveal variant="mount">
        <header className="mx-auto max-w-3xl text-center lg:mx-0 lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
            Trading Machenic
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            {dict.course.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-[var(--color-ink-muted)] lg:mx-0">
            {dict.course.intro}
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--color-gold)_45%,var(--color-bridge))] bg-[color-mix(in_oklab,var(--color-gold)_08%,var(--color-surface))] px-4 py-1.5 text-sm font-medium text-(--color-ink)">
            <span className="h-2 w-2 rounded-full bg-(--color-gold)" aria-hidden />
            {dict.course.programStructure}
          </p>
        </header>
      </Reveal>

      <section
        className="mt-14"
        aria-labelledby="education-lessons-heading"
      >        
        <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {lessons.map((lesson, index) => (
            <Reveal key={lesson.slug} className="h-full" delayMs={index * 70}>
              <CourseLessonCard
                lesson={lesson}
                locale={locale}
                index={index}
                total={total}
                dict={dict}
              />
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
