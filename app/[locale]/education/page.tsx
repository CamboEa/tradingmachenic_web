import { notFound } from "next/navigation";

import { EducationLessonGrid } from "@/components/education-lesson-grid";
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
  const [dict, lessons] = await Promise.all([
    getDictionary(locale),
    getAllLessons(),
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Reveal variant="mount">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/78 px-6 py-10 shadow-[0_24px_70px_-42px_rgba(15,23,42,0.45)] backdrop-blur sm:px-8 lg:px-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[color-mix(in_oklab,var(--color-teal)_14%,transparent)] blur-3xl" aria-hidden />
          <div className="relative max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
              Trading Machenic
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-[var(--color-ink)] sm:text-5xl">
              {dict.course.title}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-lg leading-8 text-[var(--color-ink-muted)]">
              {dict.course.intro}
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--color-gold)_45%,var(--color-bridge))] bg-[color-mix(in_oklab,var(--color-gold)_08%,var(--color-surface))] px-4 py-1.5 text-sm font-semibold text-(--color-ink)">
              <span className="h-2 w-2 rounded-full bg-(--color-gold)" aria-hidden />
              {dict.course.programStructure}
            </p>
          </div>
        </header>
      </Reveal>

      <section className="mt-14" aria-labelledby="education-lessons-heading">
        <EducationLessonGrid lessons={lessons} locale={locale} dict={dict} />
      </section>
    </main>
  );
}
