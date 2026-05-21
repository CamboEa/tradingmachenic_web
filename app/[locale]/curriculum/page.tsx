import { Fragment } from "react";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/shared/reveal";
import type { CurriculumAccent, CurriculumWeek } from "@/lib/curriculum";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getCurriculum } from "@/lib/supabase/curriculum-data";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function TimelineCard({
  week,
  index,
  accent,
  phaseLabel,
  locale,
}: {
  week: CurriculumWeek;
  index: number;
  accent: CurriculumAccent;
  phaseLabel: string;
  locale: Locale;
}) {
  const accentColor = accent === "gold" ? "var(--color-gold)" : "var(--color-teal)";
  const accentBg =
    accent === "gold"
      ? "color-mix(in oklab, var(--color-gold) 06%, var(--color-surface))"
      : "color-mix(in oklab, var(--color-teal) 06%, var(--color-surface))";
  const borderColor =
    accent === "gold"
      ? "color-mix(in oklab, var(--color-gold) 28%, var(--color-bridge))"
      : "color-mix(in oklab, var(--color-teal) 22%, var(--color-bridge))";

  return (
    <article
      style={{
        backgroundColor: accentBg,
        borderColor: borderColor,
      }}
      className="flex flex-col rounded-3xl border p-7 shadow-sm shadow-slate-900/5 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/10"
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

function TimelineCircle({ number, accent }: { number: number; accent: CurriculumAccent }) {
  const ringColor =
    accent === "gold"
      ? "color-mix(in oklab, var(--color-gold) 50%, var(--color-bridge))"
      : "color-mix(in oklab, var(--color-teal) 45%, var(--color-bridge))";
  const textColor = accent === "gold" ? "var(--color-gold)" : "var(--color-teal)";

  return (
    <div
      style={{ borderColor: ringColor, color: textColor }}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-(--color-surface) text-sm font-bold shadow-sm"
    >
      {pad(number)}
    </div>
  );
}

function PhaseDivider({ accent, label }: { accent: CurriculumAccent; label: string }) {
  const border =
    accent === "gold"
      ? "border-[color-mix(in_oklab,var(--color-gold)_35%,var(--color-bridge))]"
      : "border-[color-mix(in_oklab,var(--color-teal)_35%,var(--color-bridge))]";
  const bg =
    accent === "gold"
      ? "bg-[color-mix(in_oklab,var(--color-gold)_08%,var(--color-surface))]"
      : "bg-[color-mix(in_oklab,var(--color-teal)_07%,var(--color-surface))]";
  const text = accent === "gold" ? "text-(--color-gold)" : "text-(--color-teal)";

  return (
    <Reveal>
      <div className="my-16 flex items-center gap-4">
        <div className="h-px flex-1 bg-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)]" />
        <span
          className={`rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-wide ${border} ${bg} ${text}`}
        >
          {label}
        </span>
        <div className="h-px flex-1 bg-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)]" />
      </div>
    </Reveal>
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

  const curriculum = await getCurriculum();

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-[#1e293b] px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(212,175,55,0.18),transparent_24rem),radial-gradient(circle_at_86%_10%,rgba(14,165,233,0.2),transparent_26rem)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d4af37]">
            {cp.eyebrow}
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {cp.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
            {cp.intro}
          </p>
        </div>
      </section>

    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      {curriculum.length === 0 ? (
        <p className="mt-16 text-center text-sm text-(--color-ink-muted)">
          {locale === "km" ? "មិនទាន់មានកម្មវិធីសិក្សា។" : "Curriculum content is not available yet."}
        </p>
      ) : (
        curriculum.map((phase, phaseIdx) => {
          const phaseLabel = locale === "km" ? phase.label_km : phase.label_en;
          const phaseSub = locale === "km" ? phase.sublabel_km : phase.sublabel_en;
          const lineGradient =
            phase.accent === "gold"
              ? "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--color-gold) 35%, var(--color-bridge)) 8%, color-mix(in oklab, var(--color-gold) 35%, var(--color-bridge)) 92%, transparent)"
              : "linear-gradient(to bottom, transparent, color-mix(in oklab, var(--color-teal) 32%, var(--color-bridge)) 4%, color-mix(in oklab, var(--color-teal) 32%, var(--color-bridge)) 96%, transparent)";
          const headerBorder =
            phase.accent === "gold"
              ? "border-[color-mix(in_oklab,var(--color-gold)_40%,var(--color-bridge))] bg-[color-mix(in_oklab,var(--color-gold)_08%,var(--color-surface))] text-(--color-gold)"
              : "border-[color-mix(in_oklab,var(--color-teal)_35%,var(--color-bridge))] bg-[color-mix(in_oklab,var(--color-teal)_07%,var(--color-surface))] text-(--color-teal)";

          return (
            <Fragment key={phase.id}>
              {phaseIdx > 0 && (
                <PhaseDivider accent={phase.accent} label={phaseLabel} />
              )}

              <section className={phaseIdx === 0 ? "mt-16" : ""} aria-labelledby={`phase-${phase.slug}`}>
                <Reveal>
                  <div className="mb-10 text-center">
                    <span
                      id={`phase-${phase.slug}`}
                      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold ${headerBorder}`}
                    >
                      {phaseLabel} · {phaseSub}
                    </span>
                  </div>
                </Reveal>

                <div className="relative">
                  <div
                    className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 lg:block"
                    style={{ background: lineGradient }}
                    aria-hidden
                  />

                  <ol className="space-y-10 lg:space-y-0">
                    {phase.weeks.map((week, i) => {
                      const isLeft = i % 2 === 0;
                      const delay = phase.accent === "gold" ? i * 70 : i * 50;
                      return (
                        <li
                          key={week.id}
                          className="relative lg:grid lg:grid-cols-[1fr_3rem_1fr] lg:items-center lg:gap-0"
                        >
                          <div className={isLeft ? "lg:pr-10" : "lg:pr-10 lg:invisible"}>
                            {isLeft && (
                              <Reveal delayMs={delay}>
                                <TimelineCard
                                  week={week}
                                  index={i}
                                  accent={phase.accent}
                                  phaseLabel={phaseLabel}
                                  locale={locale}
                                />
                              </Reveal>
                            )}
                          </div>

                          <div className="hidden lg:flex lg:justify-center">
                            <TimelineCircle number={i + 1} accent={phase.accent} />
                          </div>

                          <div className={!isLeft ? "lg:pl-10" : "lg:pl-10 lg:invisible"}>
                            {!isLeft && (
                              <Reveal delayMs={delay}>
                                <TimelineCard
                                  week={week}
                                  index={i}
                                  accent={phase.accent}
                                  phaseLabel={phaseLabel}
                                  locale={locale}
                                />
                              </Reveal>
                            )}
                          </div>

                          <div className="flex items-start gap-4 lg:hidden">
                            <div className="mt-1 shrink-0">
                              <TimelineCircle number={i + 1} accent={phase.accent} />
                            </div>
                            <Reveal className="flex-1" delayMs={delay}>
                              <TimelineCard
                                week={week}
                                index={i}
                                accent={phase.accent}
                                phaseLabel={phaseLabel}
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
            </Fragment>
          );
        })
      )}
    </main>
    </div>
  );
}
