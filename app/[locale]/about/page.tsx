import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/reveal";
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
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <Reveal variant="mount">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
            {a.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            {a.title}
          </h1>
        </div>
      </Reveal>

      <Reveal delayMs={90}>
        <section
        aria-labelledby="about-why-heading"
        className="mt-10 rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] bg-[color-mix(in_oklab,var(--color-teal)_06%,var(--color-surface))] px-5 py-7 sm:px-8 sm:py-8"
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
                  className="rounded-xl border border-[color-mix(in_oklab,var(--color-bridge)_60%,transparent)] bg-(--color-surface) px-5 py-4"
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

          <blockquote className="mt-10 border-l-4 border-[var(--color-gold)] bg-[color-mix(in_oklab,var(--color-gold)_07%,var(--color-surface))] px-5 py-4 text-[var(--color-ink)]">
            {a.teachingStatement}
          </blockquote>

          <Link
            href={`/${locale}/education`}
            className="mt-10 inline-flex items-center justify-center rounded-xl bg-[var(--color-teal)] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-105"
          >
            {a.ctaEducation}
          </Link>
        </div>
        </Reveal>
      </div>
    </main>
  );
}
