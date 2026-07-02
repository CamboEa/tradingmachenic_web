import Image from "next/image";
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
      <PublicPageHero
        eyebrow={a.mentorBadge}
        title={a.title}
        description={a.experienceLine}
      />
      <PublicPageMain className="py-12 lg:py-16">
      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start lg:gap-16">
        <Reveal className="min-w-0">
          <figure className="relative mx-auto w-full max-w-sm lg:mx-0 lg:max-w-none">
          <div className="relative aspect-[4/5] w-full">
              <Image
                src="/Images/mentor2.png"
                alt={a.imageAlt}
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 90vw, 340px"
                priority
              />
            </div>
        </figure>
        </Reveal>

        <Reveal className="min-w-0" delayMs={100}>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-teal)">
            {a.mentorBadge}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl">
            Mr. {a.mentorName}
          </h2>
          <p className="mt-3 text-lg font-medium text-[var(--color-ink-muted)]">
            {a.experienceLine}
          </p>

          <div className="mt-8 space-y-5 text-pretty leading-relaxed text-[var(--color-ink-muted)]">
            {a.bioParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <blockquote className="mt-10 rounded-2xl border border-[color-mix(in_oklab,var(--color-gold)_28%,var(--color-bridge))] border-l-4 border-l-[var(--color-gold)] bg-[color-mix(in_oklab,var(--color-gold)_07%,var(--color-surface))] px-5 py-4 text-[var(--color-ink)] shadow-sm shadow-black/20">
            {a.teachingStatement}
          </blockquote>        
        </div>
        </Reveal>
      </div>

      {/* ── Roles — full width ── */}
      <Reveal className="mt-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--color-ink-soft)">
          {a.rolesLabel}
        </p>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {a.roles.map((role) => (
            <li
              key={role.org}
              className="rounded-2xl border border-bridge/30 bg-surface/88 px-5 py-4 shadow-sm shadow-black/20"
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
      </Reveal>
      {/* ── Team ── */}
      {/* ── Team ── */}
      <Reveal className="mt-24">
        <div className="px-6 py-14 sm:px-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {locale === "km" ? "ក្រុមការងាររបស់យើង" : "Our Team"}
            </h2>
            <div className="mx-auto mt-3 h-0.5 w-12 bg-teal" />
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft">
              {locale === "km"
                ? "ក្រុមការងារដែលស្ពឹកស្ពាន់ ដើម្បីផ្តល់ចំណេះដឹងការជួញដូរ និងឧបករណ៍ល្អបំផុតដល់អ្នក។"
                : "A dedicated team building the best trading education and algorithmic tools for our community."}
            </p>
          </div>

          <div className="mt-12 flex flex-col items-center justify-center gap-8 sm:flex-row sm:items-start">
            {/* Member 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="relative overflow-hidden rounded-2xl border-2 border-teal/40 shadow-lg" style={{ width: 220, height: 280 }}>
                <Image
                  src="/team/hengbunkheag.png"
                  alt="Heng Bunkheang"
                  fill
                  className="object-cover object-top"
                  sizes="220px"
                />
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground">Heng Bunkheang</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                {locale === "km" ? "អ្នកអភិវឌ្ឍន៍កម្មវិធី" : "Software Developer"}
              </p>
              <p className="mt-3 max-w-55 text-sm leading-relaxed text-ink-soft">
                {locale === "km"
                  ? "អ្នកអភិវឌ្ឍន៍ប្រព័ន្ធ Trading Web និងឧបករណ៍ Algorithmic Trading។"
                  : "Builds the trading platform and full-stack infrastructure powering the academy."}
              </p>
            </div>

            {/* Member 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="relative overflow-hidden rounded-2xl border-2 border-teal/40 shadow-lg" style={{ width: 220, height: 280 }}>
                <Image
                  src="/team/vireakyuth.png"
                  alt="Srun Virakyuth"
                  fill
                  className="object-cover object-top"
                  sizes="220px"
                />
              </div>
              <h3 className="mt-5 text-lg font-bold text-foreground">Srun Virakyuth</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                {locale === "km" ? "អ្នកអភិវឌ្ឍន៍ MQL5" : "Algorithmic Trader"}
              </p>
              <p className="mt-3 max-w-55 text-sm leading-relaxed text-ink-soft">
                {locale === "km"
                  ? "អ្នកស្ទាត់ជំនាញក្នុងការសរសេរ Expert Advisors និង Custom Indicators ក្នុង MQL5។"
                  : "Specializes in developing Indicators & Expert Advisors for financial markets."}
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </PublicPageMain>
    </div>
  );
}
