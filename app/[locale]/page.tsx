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

  return (
    <main className="flex-1">
      <HomeHeroSplit locale={locale} dict={dict} />

      {/* ── Principles ── */}
      <section
        className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-glow-teal px-4 py-24 sm:px-6 lg:px-8"
        aria-labelledby="home-principles"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid" />
        <div className="relative mx-auto w-full max-w-7xl">
          <Reveal effect="left">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-gold)">
                {dict.home.sectionPrinciples}
              </p>
              <h2
                id="home-principles"
                className="mt-3 text-3xl font-bold tracking-tight text-(--color-ink) sm:text-4xl lg:text-5xl"
              >
                {dict.home.principlesTagline}
              </h2>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3 lg:mt-20">
            {dict.home.pillars.map((pillar, i) => (
              <Reveal key={pillar.title} className="h-full" delayMs={i * 85}>
                <article className="group relative flex h-full min-h-[19rem] flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_60%,transparent)] bg-(--color-surface) p-8 shadow-sm transition hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--color-teal)_28%,var(--color-bridge))] hover:shadow-lg sm:p-10">
                  <span className="text-6xl font-semibold tabular-nums text-[color-mix(in_oklab,var(--color-bridge)_95%,var(--color-gold))] transition group-hover:text-[color-mix(in_oklab,var(--color-gold)_55%,var(--color-bridge))]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="shimmer-bar mt-5 h-1 w-12 rounded-full bg-(--color-gold)" />
                  <h3 className="mt-6 text-xl font-semibold text-(--color-ink)">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-(--color-ink-muted) sm:text-base">{pillar.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        className="section-soft relative flex min-h-screen flex-col justify-center overflow-hidden px-4 py-24 sm:px-6 lg:px-8"
        aria-labelledby="home-how"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-dots" />
        <div className="relative mx-auto w-full max-w-7xl">
          <Reveal effect="fade">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-gold)">
                {dict.home.sectionHow}
              </p>
              <h2
                id="home-how"
                className="mt-3 text-3xl font-bold tracking-tight text-(--color-ink) sm:text-4xl lg:text-5xl"
              >
                {dict.home.sectionHow}
              </h2>
            </div>
          </Reveal>
          <div className="relative mt-16 lg:mt-24">
            <ConnectorLine className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-10 hidden h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--color-bridge)_85%,transparent)_15%,color-mix(in_oklab,var(--color-gold)_45%,var(--color-bridge))_50%,color-mix(in_oklab,var(--color-bridge)_85%,transparent)_85%,transparent)] lg:block" />
            <ol className="grid gap-12 lg:grid-cols-3 lg:gap-8">
              {dict.home.howSteps.map((step, i) => (
                <li key={step.title} className="relative flex flex-col items-center">
                  <Reveal className="flex w-full flex-col items-center text-center" delayMs={i * 90}>
                    <span className="relative z-1 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-[color-mix(in_oklab,var(--color-gold)_35%,var(--color-bridge))] bg-(--color-surface) text-xl font-bold text-(--color-ink) shadow-sm transition-transform duration-500 hover:scale-[1.04]">
                      {i + 1}
                    </span>
                    <h3 className="mt-7 text-xl font-semibold text-(--color-ink)">{step.title}</h3>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-(--color-ink-muted) sm:text-base">{step.body}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Live Markets (Symbol Overview) ── */}
      <section
        className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-glow-gold px-4 py-24 sm:px-6 lg:px-8"
        aria-labelledby="home-markets"
      >
        <div className="relative mx-auto w-full max-w-7xl">
          <Reveal effect="left">
            <div className="mb-10 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-gold)">
                {dict.home.sectionMarkets}
              </p>
              <h2
                id="home-markets"
                className="mt-3 text-3xl font-bold tracking-tight text-(--color-ink) sm:text-4xl"
              >
                {dict.home.marketsTagline}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-(--color-ink-muted) sm:text-lg">
                {dict.home.marketsLead}
              </p>
            </div>
          </Reveal>
          <div className="overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] bg-white shadow-[0_20px_50px_-24px_color-mix(in_oklab,var(--color-ink)_12%,transparent)]">
            <TradingViewSymbolOverview />
          </div>
        </div>
      </section>

      {/* ── Inside the curriculum ── */}
      <section
        className="relative flex min-h-screen flex-col justify-center overflow-hidden px-4 py-24 sm:px-6 lg:px-8"
        aria-labelledby="home-learn"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid" />
        <div className="relative mx-auto w-full max-w-7xl">
          <div className="overflow-hidden rounded-3xl border border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] bg-(--color-surface) shadow-[0_20px_50px_-24px_color-mix(in_oklab,var(--color-ink)_22%,transparent)]">
            <div className="grid gap-10 p-8 lg:grid-cols-2 lg:items-center lg:gap-16 lg:p-16">
              <Reveal effect="left">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-gold)">
                    {dict.home.sectionLearn}
                  </p>
                  <p className="mt-4 text-2xl font-semibold leading-snug text-(--color-ink) sm:text-3xl">
                    {dict.home.learnLead}
                  </p>
                  <ul className="mt-8 space-y-4">
                    {dict.home.learnItems.map((item) => (
                      <li key={item} className="flex gap-3 text-(--color-ink-muted)">
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-teal)"
                          aria-hidden
                        />
                        <span className="leading-relaxed sm:text-lg">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
              <Reveal effect="right" delayMs={110}>
                <div className="flex h-full flex-col justify-between gap-8 rounded-2xl bg-[color-mix(in_oklab,var(--color-teal)_07%,var(--color-surface))] p-8 ring-1 ring-[color-mix(in_oklab,var(--color-teal)_18%,var(--color-bridge))] sm:p-10">
                  <div>
                    <p className="text-sm font-medium text-(--color-ink-soft)">
                      {dict.course.lessonsSummary.replace("{count}", String(lessonCount))}
                    </p>
                    <p className="mt-4 text-4xl font-semibold tabular-nums text-(--color-ink) sm:text-5xl">
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
          </div>
        </div>
      </section>

      {/* ── Forex Heatmap ── */}
      <section
        className="section-soft relative flex min-h-screen flex-col justify-center overflow-hidden px-4 py-24 sm:px-6 lg:px-8"
        aria-labelledby="home-heatmap"
      >
        <div className="relative mx-auto w-full max-w-7xl">
          <Reveal effect="left">
            <div className="mb-10 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-gold)">
                {dict.home.sectionHeatmap}
              </p>
              <h2
                id="home-heatmap"
                className="mt-3 text-3xl font-bold tracking-tight text-(--color-ink) sm:text-4xl"
              >
                {dict.home.heatmapTagline}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-(--color-ink-muted) sm:text-lg">
                {dict.home.heatmapLead}
              </p>
            </div>
          </Reveal>
          <div className="overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] bg-white shadow-[0_20px_50px_-24px_color-mix(in_oklab,var(--color-ink)_12%,transparent)]">
            <TradingViewForexHeatmap />
          </div>
        </div>
      </section>

      {/* ── Professional standards ── */}
      <section
        className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-glow-gold px-4 py-24 sm:px-6 lg:px-8"
        aria-labelledby="home-approach"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-dots" />
        <div className="relative mx-auto w-full max-w-7xl">
          <Reveal effect="left">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-gold)">
                {dict.home.sectionApproach}
              </p>
              <p className="mt-4 text-2xl font-semibold leading-snug text-(--color-ink) sm:text-3xl">
                {dict.home.approachLead}
              </p>
            </div>
          </Reveal>
          <ul className="mt-14 grid gap-6 sm:grid-cols-3 lg:mt-20">
            {dict.home.approachItems.map((item, i) => (
              <li key={item}>
                <Reveal className="h-full" effect="scale" delayMs={i * 75}>
                  <div className="flex h-full min-h-[14rem] flex-col rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-surface)_98%,var(--color-background))] p-8 transition hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--color-teal)_28%,var(--color-bridge))] hover:shadow-lg">
                    <span className="text-sm font-bold tabular-nums text-(--color-gold)">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="mt-4 h-1 w-10 rounded-full bg-[color-mix(in_oklab,var(--color-gold)_60%,var(--color-bridge))]" />
                    <p className="mt-5 text-sm leading-relaxed text-(--color-ink-muted) sm:text-base">
                      {item}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section
        className="relative flex min-h-screen items-center overflow-hidden bg-[#1e293b] px-4 py-24 sm:px-6 lg:px-8"
        aria-labelledby="home-cta"
      >
        <div
          className="cta-glow absolute inset-0 bg-[radial-gradient(circle_at_18%_50%,rgba(212,175,55,0.18),transparent_22rem),radial-gradient(circle_at_82%_40%,rgba(37,99,235,0.18),transparent_24rem)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="float-badge text-xs font-bold uppercase tracking-[0.25em] text-[#d4af37]">
            Algorithmic Alpha Trade
          </p>
          <h2
            id="home-cta"
            className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            {dict.home.ctaBandTitle}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-slate-300 sm:text-lg">
            {dict.home.ctaBandBody}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
