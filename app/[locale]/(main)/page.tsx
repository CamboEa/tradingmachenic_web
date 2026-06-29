import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";

import { ConnectorLine } from "@/components/shared/connector-line";
import { CourseLessonCard } from "@/components/education/course-lesson-card";
import { HomeHeroSplit } from "@/components/marketing/home-hero-split";
import { Reveal } from "@/components/shared/reveal";
import { TradingViewForexHeatmap } from "@/components/tradingview/tradingview-forex-heatmap";
import { BRAND_NAME } from "@/lib/brand";
import { getAllLessons } from "@/lib/supabase/lessons";
import { TopDownloadsTable } from "@/components/tools/top-downloads-table";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getPublishedTools } from "@/lib/supabase/tools";

function SectionIntro({
  eyebrow,
  title,
  description,
  align = "center",
  titleId,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  titleId: string;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-(--color-gold)">
        {eyebrow}
      </p>
      <h2
        id={titleId}
        className="mt-3 text-3xl font-bold tracking-tight text-(--color-ink) sm:text-4xl lg:text-5xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-(--color-ink-muted)">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function HomeSection({
  children,
  className = "",
  labelledBy,
}: {
  children: ReactNode;
  className?: string;
  labelledBy: string;
}) {
  return (
    <section
      className={`relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 ${className}`}
      aria-labelledby={labelledBy}
    >
      <div className="relative mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const [dict, lessons, tools] = await Promise.all([
    getDictionary(locale),
    getAllLessons(),
    getPublishedTools(),
  ]);

  return (
    <>
    <main className="flex-1 bg-background">
      <HomeHeroSplit locale={locale} dict={dict} videoCount={lessons.length} />

      {/* ── Meet the mentor ── */}
      <HomeSection labelledBy="home-mentor">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">

            {/* Photo */}
            <Reveal effect="left">
                <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-bridge bg-surface shadow-sm lg:mx-0 lg:max-w-none">
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src="/Images/mentor2.png"
                    alt={dict.aboutPage.imageAlt}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 1024px) 90vw, 50vw"
                  />
                </div>
              </div>
            </Reveal>

            {/* Info */}
            <Reveal effect="right" delayMs={110}>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-(--color-gold)">
                {dict.aboutPage.mentorBadge}
              </p>
              <h2
                id="home-mentor"
                className="mt-3 text-3xl font-bold tracking-tight text-(--color-ink) sm:text-4xl"
              >
                Mr. {dict.aboutPage.mentorName}
              </h2>
              <p className="mt-2 text-base font-medium text-(--color-teal)">
                {dict.aboutPage.experienceLine}
              </p>
              <p className="mt-6 text-base leading-relaxed text-(--color-ink-muted)">
                {dict.aboutPage.bioParagraphs[0]}
              </p>

              <ul className="mt-8 space-y-3">
                {dict.aboutPage.roles.map((role) => (
                  <li
                    key={role.org}
                    className="rounded-xl border border-bridge bg-surface px-5 py-4 shadow-sm transition hover:border-teal/35 hover:shadow-md"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-(--color-teal)">
                      {role.org}
                    </p>
                    <p className="mt-0.5 font-semibold text-(--color-ink)">{role.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-(--color-ink-muted)">{role.detail}</p>
                  </li>
                ))}
              </ul>

              <blockquote className="mt-8 border-l-4 border-(--color-gold) pl-4 text-base italic leading-relaxed text-(--color-ink-muted)">
                &ldquo;{dict.aboutPage.teachingStatement}&rdquo;
              </blockquote>
            </Reveal>

          </div>
      </HomeSection>

      {/* ── Featured Tools ── */}
      <HomeSection labelledBy="home-featured-tools">
          <Reveal effect="fade">
            <div className="mb-12">
              <SectionIntro
                eyebrow={dict.home.sectionFeaturedTools}
                title={dict.home.featuredToolsTagline}
                description={dict.home.featuredToolsLead}
                titleId="home-featured-tools"
              />
            </div>
          </Reveal>

          {tools.length > 0 ? (
            <Reveal effect="fade" className="w-full">
              <TopDownloadsTable tools={tools} locale={locale} limit={10} />
            </Reveal>
          ) : (
            <p className="mt-12 text-center text-sm text-(--color-ink-muted)">{dict.home.featuredToolsViewAll}</p>
          )}
      </HomeSection>

      {/* ── Featured Lessons ── */}
      <HomeSection labelledBy="home-featured-lessons" className="section-soft">
          <Reveal effect="fade">
            <div className="mb-12">
              <SectionIntro
                eyebrow={dict.home.sectionFeaturedLessons}
                title={dict.home.featuredLessonsTagline}
                description={dict.home.featuredLessonsLead}
                titleId="home-featured-lessons"
              />
            </div>
          </Reveal>

          {lessons.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.slice(0, 6).map((lesson, i) => (
                <Reveal key={lesson.slug} delayMs={i * 80}>
                  <CourseLessonCard
                    lesson={lesson}
                    locale={locale}
                    index={i}
                    dict={dict}
                  />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="mt-12 text-center text-sm text-ink-soft">{dict.home.featuredLessonsViewAll}</p>
          )}

          <div className="mt-12 text-center">
            <Link
              href={`/${locale}/education`}
              className="inline-flex items-center gap-2 rounded-lg border border-bridge bg-surface px-8 py-3 text-sm font-semibold text-(--color-ink) shadow-sm transition hover:-translate-y-0.5 hover:border-teal/40 hover:text-teal"
            >
              {dict.home.featuredLessonsViewAll} →
            </Link>
          </div>
      </HomeSection>

      {/* ── How it works ── */}
      <HomeSection labelledBy="home-how">
          <Reveal effect="fade">
            <SectionIntro
              eyebrow={dict.home.sectionHow}
              title={dict.home.sectionHow}
              titleId="home-how"
            />
          </Reveal>
          <div className="relative mt-16 lg:mt-24">
            <ConnectorLine className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-10 hidden h-px bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--color-bridge)_60%,transparent)_15%,color-mix(in_oklab,var(--color-gold)_55%,transparent)_50%,color-mix(in_oklab,var(--color-bridge)_60%,transparent)_85%,transparent)] lg:block" />
            <ol className="grid gap-12 lg:grid-cols-3 lg:gap-8">
              {dict.home.howSteps.map((step, i) => (
                <li key={step.title} className="relative flex flex-col items-center">
                  <Reveal className="flex w-full flex-col items-center text-center" delayMs={i * 90}>
                    <span className="relative z-1 flex h-20 w-20 items-center justify-center rounded-lg border-2 border-[color-mix(in_oklab,var(--color-gold)_45%,var(--color-bridge))] bg-(--color-surface) text-xl font-bold text-(--color-ink) shadow-sm transition-transform duration-500 hover:scale-[1.04]">
                      {i + 1}
                    </span>
                    <h3 className="mt-7 text-xl font-semibold text-(--color-ink)">{step.title}</h3>
                    <p className="mt-3 max-w-xs text-sm leading-relaxed text-(--color-ink-muted) sm:text-base">{step.body}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
      </HomeSection>

      {/* ── Forex Heatmap ── */}
      <HomeSection labelledBy="home-heatmap" className="section-soft">
          <Reveal effect="left">
            <div className="mb-10">
              <SectionIntro
                eyebrow={dict.home.sectionHeatmap}
                title={dict.home.heatmapTagline}
                description={dict.home.heatmapLead}
                align="left"
                titleId="home-heatmap"
              />
            </div>
          </Reveal>
          <div className="overflow-hidden rounded-lg border border-bridge bg-surface shadow-sm">
            <TradingViewForexHeatmap />
          </div>
      </HomeSection>

      {/* ── Professional standards ── */}
      <HomeSection labelledBy="home-approach">
          <Reveal effect="left">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-(--color-gold)">
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
                  <div className="flex h-full min-h-56 flex-col rounded-lg border border-bridge bg-surface p-8 shadow-sm transition hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--color-teal)_28%,var(--color-bridge))] hover:shadow-md">
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
      </HomeSection>

      {/* ── CTA Band ── */}
      <section
        className="relative flex min-h-screen items-center overflow-hidden bg-slate-brand px-4 py-24 sm:px-6 lg:px-8"
        aria-labelledby="home-cta"
      >
        {/* Alternating background images */}
        <Image
          src="/Images/hero.png"
          alt=""
          fill
          sizes="100vw"
          aria-hidden
          className="cta-bg-1 object-cover object-center"
        />
        <Image
          src="/Images/bg-about-header.png"
          alt=""
          fill
          sizes="100vw"
          aria-hidden
          className="cta-bg-2 object-cover object-center opacity-0"
        />
        {/* Dark overlay to keep text readable */}
        <div className="absolute inset-0 bg-slate-brand/50" aria-hidden />
        <div
          className="cta-glow absolute inset-0 bg-[linear-gradient(120deg,rgba(212,175,55,0.18),transparent_34%),linear-gradient(300deg,rgba(14,165,233,0.18),transparent_38%)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="float-badge text-xs font-bold uppercase tracking-[0.25em] text-gold">
            {BRAND_NAME}
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
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-3.5 text-sm font-bold text-slate-brand shadow-lg transition hover:-translate-y-0.5 hover:brightness-105"
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
    <SiteFooter locale={locale} dict={dict} />
    </>
  );
}
