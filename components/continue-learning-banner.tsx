import Link from "next/link";

export function ContinueLearningBanner({
  href,
  title,
  lessonTitle,
  cta,
}: {
  href: string;
  title: string;
  lessonTitle: string;
  cta: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-[color-mix(in_oklab,var(--color-teal)_35%,var(--color-bridge))] bg-[color-mix(in_oklab,var(--color-teal)_8%,var(--color-surface))] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-teal)]">
            {title}
          </p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-ink)]">{lessonTitle}</p>
        </div>
        <Link
          href={href}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#0ea5e9] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
        >
          {cta}
        </Link>
      </div>
    </section>
  );
}
