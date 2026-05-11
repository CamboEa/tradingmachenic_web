import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const dict = await getDictionary(raw);
  const t = dict.toolsPage;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-gold)]">
          {t.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-4 text-pretty text-lg leading-relaxed text-[var(--color-ink-muted)]">
          {t.intro}
        </p>
      </header>

      <div className="mt-10 rounded-2xl border border-[color-mix(in_oklab,var(--color-gold)_38%,var(--color-bridge))] bg-[color-mix(in_oklab,var(--color-gold)_09%,var(--color-surface))] px-6 py-8 text-center shadow-sm sm:px-10 sm:py-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-gold)]">
          {t.comingSoon}
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-[var(--color-ink-muted)]">
          {t.comingSoonDetail}
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_60%,transparent)] bg-[var(--color-surface)] p-8 shadow-sm">
          <div className="mb-3 h-1 w-12 rounded-full bg-[var(--color-teal)]" />
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">
            {t.indicatorsTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
            {t.indicatorsDescription}
          </p>
          <p className="mt-6 inline-flex rounded-full border border-[color-mix(in_oklab,var(--color-bridge)_65%,transparent)] bg-[color-mix(in_oklab,var(--color-background)_50%,var(--color-surface))] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
            {t.comingSoon}
          </p>
        </section>
        <section className="rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_60%,transparent)] bg-[var(--color-surface)] p-8 shadow-sm">
          <div className="mb-3 h-1 w-12 rounded-full bg-[var(--color-gold)]" />
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">
            {t.expertAdvisorsTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-muted)]">
            {t.expertAdvisorsDescription}
          </p>
          <p className="mt-6 inline-flex rounded-full border border-[color-mix(in_oklab,var(--color-bridge)_65%,transparent)] bg-[color-mix(in_oklab,var(--color-background)_50%,var(--color-surface))] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
            {t.comingSoon}
          </p>
        </section>
      </div>
    </main>
  );
}
