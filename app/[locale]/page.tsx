import Link from "next/link";
import { notFound } from "next/navigation";

import { HomeHeroSplit } from "@/components/home-hero-split";
import { Reveal } from "@/components/reveal";
import { getAllLessons } from "@/lib/supabase/lessons";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const lessons = await getAllLessons();
  const lessonCount = lessons.length;
  const stats = dict.home.stats.map((s) => ({
    value: s.value.replace("{count}", String(lessonCount)),
    label: s.label,
  }));

  return (
    <main className="flex-1">
      <HomeHeroSplit locale={locale} dict={dict} />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <section aria-labelledby="home-principles">
          <Reveal>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2
                  id="home-principles"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]"
                >
                  {dict.home.sectionPrinciples}
                </h2>
                <p className="mt-2 max-w-xl text-lg font-medium text-[var(--color-ink)]">
                  {dict.home.principlesTagline}
                </p>
              </div>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {dict.home.pillars.map((pillar, i) => (
              <Reveal key={pillar.title} className="h-full" delayMs={i * 85}>
              <article
                className="group relative h-full overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_60%,transparent)] bg-[var(--color-surface)] p-7 shadow-sm transition hover:border-[color-mix(in_oklab,var(--color-teal)_28%,var(--color-bridge))] hover:shadow-md"
              >
                <span className="text-5xl font-semibold tabular-nums text-[color-mix(in_oklab,var(--color-bridge)_95%,var(--color-gold))] transition group-hover:text-[color-mix(in_oklab,var(--color-gold)_55%,var(--color-bridge))]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mt-4 h-1 w-12 rounded-full bg-[var(--color-gold)]" />
                <h3 className="mt-5 text-lg font-semibold text-[var(--color-ink)]">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                  {pillar.body}
                </p>
              </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mt-24" aria-labelledby="home-how">
          <Reveal>
            <h2
              id="home-how"
              className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]"
            >
              {dict.home.sectionHow}
            </h2>
          </Reveal>
          <div className="relative mt-12 lg:mt-16">
            <div
              className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[2.25rem] hidden h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--color-bridge)_85%,transparent)_15%,color-mix(in_oklab,var(--color-gold)_45%,var(--color-bridge))_50%,color-mix(in_oklab,var(--color-bridge)_85%,transparent)_85%,transparent)] lg:block"
              aria-hidden
            />
            <ol className="grid gap-10 lg:grid-cols-3 lg:gap-6">
              {dict.home.howSteps.map((step, i) => (
                <li key={step.title} className="relative flex flex-col items-center">
                  <Reveal className="flex w-full flex-col items-center text-center" delayMs={i * 90}>
                    <span className="relative z-[1] flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border-2 border-[color-mix(in_oklab,var(--color-gold)_35%,var(--color-bridge))] bg-[var(--color-surface)] text-lg font-bold text-[var(--color-ink)] shadow-sm transition-transform duration-500 hover:scale-[1.04]">
                      {i + 1}
                    </span>
                    <h3 className="mt-6 text-lg font-semibold text-[var(--color-ink)]">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--color-ink-muted)]">
                      {step.body}
                    </p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="mt-24 overflow-hidden rounded-3xl border border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] bg-[var(--color-surface)] shadow-[0_20px_50px_-24px_color-mix(in_oklab,var(--color-ink)_22%,transparent)]"
          aria-labelledby="home-learn"
        >
          <div className="grid gap-10 p-8 lg:grid-cols-2 lg:gap-16 lg:p-12">
            <Reveal>
              <div>
                <h2
                  id="home-learn"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]"
                >
                  {dict.home.sectionLearn}
                </h2>
                <p className="mt-4 text-xl font-semibold leading-snug text-[var(--color-ink)]">
                  {dict.home.learnLead}
                </p>
                <ul className="mt-8 space-y-4">
                  {dict.home.learnItems.map((item) => (
                    <li key={item} className="flex gap-3 text-[var(--color-ink-muted)]">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-teal)]"
                        aria-hidden
                      />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delayMs={110}>
              <div className="flex h-full flex-col justify-between gap-8 rounded-2xl bg-[color-mix(in_oklab,var(--color-teal)_07%,var(--color-surface))] p-8 ring-1 ring-[color-mix(in_oklab,var(--color-teal)_18%,var(--color-bridge))]">
                <div>
                  <p className="text-sm font-medium text-[var(--color-ink-soft)]">
                    {dict.course.lessonsSummary.replace("{count}", String(lessonCount))}
                  </p>
                  <p className="mt-4 text-3xl font-semibold tabular-nums text-[var(--color-ink)]">
                    {lessonCount}
                    <span className="ml-2 text-lg font-normal text-[var(--color-ink-muted)]">
                      {dict.home.lessonsNoun}
                    </span>
                  </p>
                </div>
                <Link
                  href={`/${locale}/education`}
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-[var(--color-teal)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105"
                >
                  {dict.home.learnLink}
                  <span aria-hidden className="text-base leading-none">
                    →
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="mt-24" aria-labelledby="home-approach">
          <Reveal>
            <div>
              <h2
                id="home-approach"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]"
              >
                {dict.home.sectionApproach}
              </h2>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[var(--color-ink-muted)]">
                {dict.home.approachLead}
              </p>
            </div>
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {dict.home.approachItems.map((item, i) => (
              <li key={item} className="min-h-0">
                <Reveal className="h-full" delayMs={i * 75}>
                  <div className="h-full rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-surface)_98%,var(--color-background))] p-6 text-sm leading-relaxed text-[var(--color-ink-muted)]">
                    {item}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="mt-24 rounded-3xl border border-[color-mix(in_oklab,var(--color-gold)_38%,var(--color-bridge))] bg-[color-mix(in_oklab,var(--color-gold)_07%,var(--color-surface))] px-8 py-12 text-center lg:px-16 lg:py-16"
          aria-labelledby="home-cta-band"
        >
          <Reveal>
            <h2
              id="home-cta-band"
              className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl"
            >
              {dict.home.ctaBandTitle}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-[var(--color-ink-muted)]">
              {dict.home.ctaBandBody}
            </p>
            <Link
              href={`/${locale}/education`}
              className="mt-10 inline-flex items-center justify-center rounded-xl bg-[var(--color-teal)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[color-mix(in_oklab,var(--color-teal)_28%,transparent)] transition hover:brightness-105"
            >
              {dict.home.ctaBandButton}
            </Link>
          </Reveal>
        </section>
      </div>
    </main>
  );
}
