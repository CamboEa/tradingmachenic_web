import Link from "next/link";
import { notFound } from "next/navigation";

import { ConnectorLine } from "@/components/shared/connector-line";
import { CountUp } from "@/components/shared/count-up";
import { HomeHeroSplit } from "@/components/marketing/home-hero-split";
import { Reveal } from "@/components/shared/reveal";
import { TradingViewForexHeatmap } from "@/components/tradingview/tradingview-forex-heatmap";
import { TradingViewSymbolOverview } from "@/components/tradingview/tradingview-symbol-overview";
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
  const [dict, lessons] = await Promise.all([
    getDictionary(locale),
    getAllLessons(),
  ]);
  const lessonCount = lessons.length;

  const stats = dict.home.stats.map((s) => ({
    value: s.value.replace("{count}", String(lessonCount)),
    label: s.label,
  }));

  return (
    <main className="flex-1">
      <HomeHeroSplit locale={locale} dict={dict} />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">

        {/* ── Principles ── */}
        <section aria-labelledby="home-principles">
          <Reveal effect="left">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2
                  id="home-principles"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-gold)"
                >
                  {dict.home.sectionPrinciples}
                </h2>
                <p className="mt-2 max-w-xl text-lg font-medium text-(--color-ink)">
                  {dict.home.principlesTagline}
                </p>
              </div>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {dict.home.pillars.map((pillar, i) => (
              <Reveal key={pillar.title} className="h-full" delayMs={i * 85}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_60%,transparent)] bg-(--color-surface) p-7 shadow-sm transition hover:border-[color-mix(in_oklab,var(--color-teal)_28%,var(--color-bridge))] hover:shadow-md">
                  <span className="text-5xl font-semibold tabular-nums text-[color-mix(in_oklab,var(--color-bridge)_95%,var(--color-gold))] transition group-hover:text-[color-mix(in_oklab,var(--color-gold)_55%,var(--color-bridge))]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="shimmer-bar mt-4 h-1 w-12 rounded-full bg-(--color-gold)" />
                  <h3 className="mt-5 text-lg font-semibold text-(--color-ink)">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-(--color-ink-muted)">{pillar.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="mt-24" aria-labelledby="home-how">
          <Reveal effect="fade">
            <h2
              id="home-how"
              className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-(--color-gold)"
            >
              {dict.home.sectionHow}
            </h2>
          </Reveal>
          <div className="relative mt-12 lg:mt-16">
            <ConnectorLine className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-9 hidden h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--color-bridge)_85%,transparent)_15%,color-mix(in_oklab,var(--color-gold)_45%,var(--color-bridge))_50%,color-mix(in_oklab,var(--color-bridge)_85%,transparent)_85%,transparent)] lg:block" />
            <ol className="grid gap-10 lg:grid-cols-3 lg:gap-6">
              {dict.home.howSteps.map((step, i) => (
                <li key={step.title} className="relative flex flex-col items-center">
                  <Reveal className="flex w-full flex-col items-center text-center" delayMs={i * 90}>
                    <span className="relative z-1 flex h-18 w-18 items-center justify-center rounded-2xl border-2 border-[color-mix(in_oklab,var(--color-gold)_35%,var(--color-bridge))] bg-(--color-surface) text-lg font-bold text-(--color-ink) shadow-sm transition-transform duration-500 hover:scale-[1.04]">
                      {i + 1}
                    </span>
                    <h3 className="mt-6 text-lg font-semibold text-(--color-ink)">{step.title}</h3>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-(--color-ink-muted)">{step.body}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Live Markets (Symbol Overview) ── */}
        <section className="mt-24" aria-labelledby="home-markets">
          <Reveal effect="left">
            <div className="mb-8">
              <h2
                id="home-markets"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-gold)"
              >
                {dict.home.sectionMarkets}
              </h2>
              <p className="mt-2 text-xl font-semibold text-(--color-ink)">
                {dict.home.marketsTagline}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--color-ink-muted)">
                {dict.home.marketsLead}
              </p>
            </div>
          </Reveal>
          <div className="overflow-hidden rounded-none border border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] bg-white shadow-[0_20px_50px_-24px_color-mix(in_oklab,var(--color-ink)_12%,transparent)]">
            <TradingViewSymbolOverview />
          </div>
        </section>

        {/* ── Inside the curriculum ── */}
        <section
          className="mt-24 overflow-hidden rounded-3xl border border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] bg-(--color-surface) shadow-[0_20px_50px_-24px_color-mix(in_oklab,var(--color-ink)_22%,transparent)]"
          aria-labelledby="home-learn"
        >
          <div className="grid gap-10 p-8 lg:grid-cols-2 lg:gap-16 lg:p-12">
            <Reveal effect="left">
              <div>
                <h2
                  id="home-learn"
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-gold)"
                >
                  {dict.home.sectionLearn}
                </h2>
                <p className="mt-4 text-xl font-semibold leading-snug text-(--color-ink)">
                  {dict.home.learnLead}
                </p>
                <ul className="mt-8 space-y-4">
                  {dict.home.learnItems.map((item) => (
                    <li key={item} className="flex gap-3 text-(--color-ink-muted)">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-teal)"
                        aria-hidden
                      />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal effect="right" delayMs={110}>
              <div className="flex h-full flex-col justify-between gap-8 rounded-2xl bg-[color-mix(in_oklab,var(--color-teal)_07%,var(--color-surface))] p-8 ring-1 ring-[color-mix(in_oklab,var(--color-teal)_18%,var(--color-bridge))]">
                <div>
                  <p className="text-sm font-medium text-(--color-ink-soft)">
                    {dict.course.lessonsSummary.replace("{count}", String(lessonCount))}
                  </p>
                  <p className="mt-4 text-3xl font-semibold tabular-nums text-(--color-ink)">
                    <CountUp end={lessonCount} />
                    <span className="ml-2 text-lg font-normal text-(--color-ink-muted)">
                      {dict.home.lessonsNoun}
                    </span>
                  </p>
                </div>
                <Link
                  href={`/${locale}/education`}
                  className="inline-flex w-fit items-center gap-2 rounded-xl bg-(--color-teal) px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105"
                >
                  {dict.home.learnLink}
                  <span aria-hidden className="text-base leading-none">→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Forex Heatmap ── */}
        <section className="mt-24" aria-labelledby="home-heatmap">
          <Reveal effect="left">
            <div className="mb-8">
              <h2
                id="home-heatmap"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-gold)"
              >
                {dict.home.sectionHeatmap}
              </h2>
              <p className="mt-2 text-xl font-semibold text-(--color-ink)">
                {dict.home.heatmapTagline}
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-(--color-ink-muted)">
                {dict.home.heatmapLead}
              </p>
            </div>
          </Reveal>
          <div className="overflow-hidden border border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] bg-white shadow-[0_20px_50px_-24px_color-mix(in_oklab,var(--color-ink)_12%,transparent)]">
            <TradingViewForexHeatmap />
          </div>
        </section>

        {/* ── Professional standards ── */}
        <section className="mt-24" aria-labelledby="home-approach">
          <Reveal effect="left">
            <div>
              <h2
                id="home-approach"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-gold)"
              >
                {dict.home.sectionApproach}
              </h2>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-(--color-ink-muted)">
                {dict.home.approachLead}
              </p>
            </div>
          </Reveal>
          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            {dict.home.approachItems.map((item, i) => (
              <li key={item} className="min-h-0">
                <Reveal className="h-full" effect="scale" delayMs={i * 75}>
                  <div className="h-full rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-surface)_98%,var(--color-background))] p-6 text-sm leading-relaxed text-(--color-ink-muted)">
                    {item}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

      </div>

      {/* ── CTA Band ── */}
      <section
        className="relative overflow-hidden bg-[#1e293b] px-4 py-16 sm:px-6 lg:px-8"
        aria-labelledby="home-cta"
      >
        <div
          className="cta-glow absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,rgba(212,175,55,0.18),transparent_22rem),radial-gradient(circle_at_82%_40%,rgba(14,165,233,0.18),transparent_24rem)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="float-badge text-xs font-bold uppercase tracking-[0.25em] text-[#d4af37]">
            Trading Machenic
          </p>
          <h2
            id="home-cta"
            className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl"
          >
            {dict.home.ctaBandTitle}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-300">
            {dict.home.ctaBandBody}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/${locale}/education`}
              className="inline-flex items-center gap-2 rounded-xl bg-[#d4af37] px-8 py-3.5 text-sm font-bold text-[#0f172a] shadow-lg transition hover:-translate-y-0.5 hover:brightness-105"
            >
              {dict.home.ctaBandButton}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href={`/${locale}/curriculum`}
              className="text-sm font-semibold text-slate-300 underline-offset-4 transition hover:text-white hover:underline"
            >
              {dict.home.ctaOutline}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
