import { notFound } from "next/navigation";

import { Reveal } from "@/components/reveal";
import { curriculum, type CurriculumWeek } from "@/lib/curriculum";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function TimelineCard({
  week,
  index,
  phase,
  phaseLabel,
  locale,
}: {
  week: CurriculumWeek;
  index: number;
  phase: "theory" | "practice";
  phaseLabel: string;
  locale: Locale;
}) {
  const accentColor =
    phase === "theory" ? "var(--color-gold)" : "var(--color-teal)";
  const accentBg =
    phase === "theory"
      ? "color-mix(in oklab, var(--color-gold) 06%, var(--color-surface))"
      : "color-mix(in oklab, var(--color-teal) 06%, var(--color-surface))";
  const borderColor =
    phase === "theory"
      ? "color-mix(in oklab, var(--color-gold) 28%, var(--color-bridge))"
      : "color-mix(in oklab, var(--color-teal) 22%, var(--color-bridge))";

  return (
    <article
      style={{
        backgroundColor: accentBg,
        borderColor: borderColor,
      }}
      className="flex flex-col rounded-2xl border p-7 shadow-sm"
    >
      <p
        style={{ color: accentColor }}
        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
      >
        {phaseLabel} {pad(index + 1)}
      </p>
      <h3 className="mt-3 text-xl font-semibold tracking-tight text-(--color-ink)">
        {week.titles[locale]}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-(--color-ink-muted)">
        {week.focus[locale]}
      </p>
      <ul className="mt-5 space-y-2 border-t border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] pt-4">
        {week.activities[locale].map((act) => (
          <li key={act} className="flex items-start gap-2 text-sm text-(--color-ink-muted)">
            <span
              style={{ backgroundColor: accentColor }}
              className="mt-[0.38rem] h-1.5 w-1.5 shrink-0 rounded-full"
              aria-hidden
            />
            {act}
          </li>
        ))}
      </ul>
    </article>
  );
}

function TimelineCircle({
  number,
  phase,
}: {
  number: number;
  phase: "theory" | "practice";
}) {
  const ringColor =
    phase === "theory"
      ? "color-mix(in oklab, var(--color-gold) 50%, var(--color-bridge))"
      : "color-mix(in oklab, var(--color-teal) 45%, var(--color-bridge))";
  const textColor =
    phase === "theory" ? "var(--color-gold)" : "var(--color-teal)";

  return (
    <div
      style={{ borderColor: ringColor, color: textColor }}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-(--color-surface) text-sm font-bold shadow-sm"
    >
      {pad(number)}
    </div>
  );
}

export default async function CurriculumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const cp = dict.curriculumPage;

  const theoryPhase = curriculum.find((p) => p.phase === "theory")!;
  const practicePhase = curriculum.find((p) => p.phase === "practice")!;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      {/* Header */}
      <Reveal variant="mount">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-gold)">
            {cp.eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-(--color-ink) sm:text-4xl">
            {cp.title}
          </h1>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-(--color-ink-muted)">
            {cp.intro}
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--color-gold)_45%,var(--color-bridge))] bg-[color-mix(in_oklab,var(--color-gold)_08%,var(--color-surface))] px-4 py-1.5 text-sm font-medium text-(--color-ink)">
            <span className="h-2 w-2 rounded-full bg-(--color-gold)" aria-hidden />
            {dict.course.programStructure}
          </p>
        </header>
      </Reveal>

      {/* ── Theory Phase ── */}
      <section className="mt-16" aria-labelledby="theory-heading">
        <Reveal>
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--color-gold)_40%,var(--color-bridge))] bg-[color-mix(in_oklab,var(--color-gold)_08%,var(--color-surface))] px-5 py-2 text-sm font-semibold text-(--color-gold)">
              {cp.theoryPhaseLabel} · {cp.theoryPhaseSub}
            </span>
          </div>
        </Reveal>

        {/* Zigzag timeline */}
        <div className="relative">
          {/* Vertical line — desktop only */}
          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 lg:block"
            style={{
              background:
                "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--color-gold) 35%, var(--color-bridge)) 8%, color-mix(in oklab, var(--color-gold) 35%, var(--color-bridge)) 92%, transparent)",
            }}
            aria-hidden
          />

          <ol className="space-y-10 lg:space-y-0">
            {theoryPhase.weeks.map((week, i) => {
              const isLeft = i % 2 === 0;
              return (
                <li
                  key={i}
                  className="relative lg:grid lg:grid-cols-[1fr_3rem_1fr] lg:items-center lg:gap-0"
                >
                  {/* Left slot */}
                  <div className={isLeft ? "lg:pr-10" : "lg:pr-10 lg:invisible"}>
                    {isLeft && (
                      <Reveal delayMs={i * 70}>
                        <TimelineCard
                          week={week}
                          index={i}
                          phase="theory"
                          phaseLabel={cp.theoryPhaseLabel}
                          locale={locale}
                        />
                      </Reveal>
                    )}
                  </div>

                  {/* Center circle */}
                  <div className="hidden lg:flex lg:justify-center">
                    <TimelineCircle number={i + 1} phase="theory" />
                  </div>

                  {/* Right slot */}
                  <div className={!isLeft ? "lg:pl-10" : "lg:pl-10 lg:invisible"}>
                    {!isLeft && (
                      <Reveal delayMs={i * 70}>
                        <TimelineCard
                          week={week}
                          index={i}
                          phase="theory"
                          phaseLabel={cp.theoryPhaseLabel}
                          locale={locale}
                        />
                      </Reveal>
                    )}
                  </div>

                  {/* Mobile: always show card + circle on the left */}
                  <div className="flex items-start gap-4 lg:hidden">
                    <div className="mt-1 shrink-0">
                      <TimelineCircle number={i + 1} phase="theory" />
                    </div>
                    <Reveal className="flex-1" delayMs={i * 70}>
                      <TimelineCard
                        week={week}
                        index={i}
                        phase="theory"
                        phaseLabel={cp.theoryPhaseLabel}
                        locale={locale}
                      />
                    </Reveal>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Phase transition */}
      <Reveal>
        <div className="my-16 flex items-center gap-4">
          <div className="h-px flex-1 bg-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)]" />
          <span className="rounded-full border border-[color-mix(in_oklab,var(--color-teal)_35%,var(--color-bridge))] bg-[color-mix(in_oklab,var(--color-teal)_07%,var(--color-surface))] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-(--color-teal)">
            {cp.practicePhaseLabel}
          </span>
          <div className="h-px flex-1 bg-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)]" />
        </div>
      </Reveal>

      {/* ── Practice Phase ── */}
      <section aria-labelledby="practice-heading">
        <Reveal>
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--color-teal)_35%,var(--color-bridge))] bg-[color-mix(in_oklab,var(--color-teal)_07%,var(--color-surface))] px-5 py-2 text-sm font-semibold text-(--color-teal)">
              {cp.practicePhaseLabel} · {cp.practicePhaseSub}
            </span>
          </div>
        </Reveal>

        <div className="relative">
          {/* Vertical line — desktop only */}
          <div
            className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 lg:block"
            style={{
              background:
                "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--color-teal) 32%, var(--color-bridge)) 4%, color-mix(in oklab, var(--color-teal) 32%, var(--color-bridge)) 96%, transparent)",
            }}
            aria-hidden
          />

          <ol className="space-y-10 lg:space-y-0">
            {practicePhase.weeks.map((week, i) => {
              const isLeft = i % 2 === 0;
              return (
                <li
                  key={i}
                  className="relative lg:grid lg:grid-cols-[1fr_3rem_1fr] lg:items-center lg:gap-0"
                >
                  {/* Left slot */}
                  <div className={isLeft ? "lg:pr-10" : "lg:pr-10 lg:invisible"}>
                    {isLeft && (
                      <Reveal delayMs={i * 50}>
                        <TimelineCard
                          week={week}
                          index={i}
                          phase="practice"
                          phaseLabel={cp.practicePhaseLabel}
                          locale={locale}
                        />
                      </Reveal>
                    )}
                  </div>

                  {/* Center circle */}
                  <div className="hidden lg:flex lg:justify-center">
                    <TimelineCircle number={i + 1} phase="practice" />
                  </div>

                  {/* Right slot */}
                  <div className={!isLeft ? "lg:pl-10" : "lg:pl-10 lg:invisible"}>
                    {!isLeft && (
                      <Reveal delayMs={i * 50}>
                        <TimelineCard
                          week={week}
                          index={i}
                          phase="practice"
                          phaseLabel={cp.practicePhaseLabel}
                          locale={locale}
                        />
                      </Reveal>
                    )}
                  </div>

                  {/* Mobile */}
                  <div className="flex items-start gap-4 lg:hidden">
                    <div className="mt-1 shrink-0">
                      <TimelineCircle number={i + 1} phase="practice" />
                    </div>
                    <Reveal className="flex-1" delayMs={i * 50}>
                      <TimelineCard
                        week={week}
                        index={i}
                        phase="practice"
                        phaseLabel={cp.practicePhaseLabel}
                        locale={locale}
                      />
                    </Reveal>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </main>
  );
}
