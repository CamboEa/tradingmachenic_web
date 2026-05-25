import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/shared/reveal";
import { PublicPageHero, PublicPageMain } from "@/components/ui";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = await getDictionary(raw);
  return {
    title: dict.aboutPage.title,
    description: `${dict.aboutPage.whyTitle} ${dict.aboutPage.mentorName} — ${dict.aboutPage.experienceLine} ${dict.aboutPage.teachingStatement}`,
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const a = dict.aboutPage;

  return (
    <div className="flex flex-col">
      <PublicPageHero eyebrow={a.eyebrow} title={a.title} description={a.intro} />
      <PublicPageMain className="py-12 lg:py-16">
      <Reveal delayMs={90}>
        <section
        aria-labelledby="about-why-heading"
        className="mt-10 rounded-[1.5rem] border border-[color-mix(in_oklab,var(--color-teal)_18%,var(--color-bridge))] bg-[color-mix(in_oklab,var(--color-teal)_06%,var(--color-surface))] px-5 py-7 shadow-sm shadow-slate-900/5 sm:px-8 sm:py-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-teal)]">
          {a.whyEyebrow}
        </p>
        <h2
          id="about-why-heading"
          className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-2xl"
        >
          {a.whyTitle}
        </h2>
        <div className="mt-4 space-y-4 text-pretty leading-relaxed text-[var(--color-ink-muted)]">
          {a.whyParagraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-16">
        <Reveal className="min-w-0">
          <figure className="relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
          <div className="relative overflow-hidden rounded-3xl border border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] bg-[var(--color-surface)] shadow-[0_20px_50px_-24px_color-mix(in_oklab,var(--color-ink)_22%,transparent)] ring-2 ring-[color-mix(in_oklab,var(--color-gold)_35%,transparent)] ring-offset-4 ring-offset-[var(--background)] transition-[box-shadow,transform] duration-500 hover:-translate-y-0.5 hover:shadow-[0_28px_60px_-22px_color-mix(in_oklab,var(--color-ink)_28%,transparent)]">
            <div className="relative aspect-[4/5] w-full">
              <Image
                src="/Images/mentor.png"
                alt={a.imageAlt}
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 90vw, 340px"
                priority
              />
            </div>
          </div>
        </figure>
        </Reveal>

        <Reveal className="min-w-0" delayMs={100}>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-teal)]">
            {a.mentorBadge}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            {a.mentorName}
          </h2>
          <p className="mt-3 text-lg font-medium text-[var(--color-ink-muted)]">
            {a.experienceLine}
          </p>

          <div className="mt-8 space-y-5 text-pretty leading-relaxed text-[var(--color-ink-muted)]">
            {a.bioParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {/* Roles */}
          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-ink-soft)">
              {a.rolesLabel}
            </p>
            <ul className="mt-4 space-y-3">
              {a.roles.map((role) => (
              <li
                  key={role.org}
                  className="rounded-2xl border border-white/80 bg-white/88 px-5 py-4 shadow-sm shadow-slate-900/5"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-(--color-teal)">
                    {role.org}
                  </p>
                  <p className="mt-1 font-semibold text-(--color-ink)">
                    {role.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-(--color-ink-muted)">
                    {role.detail}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <blockquote className="mt-10 rounded-2xl border border-[color-mix(in_oklab,var(--color-gold)_28%,var(--color-bridge))] border-l-4 border-l-[var(--color-gold)] bg-[color-mix(in_oklab,var(--color-gold)_07%,var(--color-surface))] px-5 py-4 text-[var(--color-ink)] shadow-sm shadow-slate-900/5">
            {a.teachingStatement}
          </blockquote>

          <Link
            href={`/${locale}/education`}
            className="mt-10 inline-flex items-center justify-center rounded-2xl bg-[var(--color-teal)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[color-mix(in_oklab,var(--color-teal)_25%,transparent)] transition hover:-translate-y-0.5 hover:brightness-105"
          >
            {a.ctaEducation}
          </Link>
        </div>
        </Reveal>
      </div>
    </PublicPageMain>
    </div>
  );
}
