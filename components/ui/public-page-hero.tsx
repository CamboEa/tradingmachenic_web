import { cn } from "@/lib/ui/cn";

const TICK_MARKS = [
  { left: "18%", bottom: "22%", height: "1.25rem", delayClass: "" },
  { left: "34%", bottom: "18%", height: "2rem", delayClass: "page-hero-tick-2" },
  { left: "52%", bottom: "26%", height: "1.5rem", delayClass: "page-hero-tick-3" },
  { left: "71%", bottom: "20%", height: "2.25rem", delayClass: "page-hero-tick-4" },
] as const;

function HeroBackdrop() {
  return (
    <>
      <div
        aria-hidden
        className="page-hero-grid pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: [
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 56px)",
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 48px)",
          ].join(","),
        }}
      />

      <div
        aria-hidden
        className="page-hero-orb-gold pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/12 blur-3xl"
      />
      <div
        aria-hidden
        className="page-hero-orb-teal pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-teal/10 blur-3xl"
      />
      <div
        aria-hidden
        className="page-hero-orb-gold pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_85%_15%,color-mix(in_oklab,var(--color-gold)_14%,transparent),transparent_55%)]"
        style={{ animationDuration: "22s" }}
      />
      <div
        aria-hidden
        className="page-hero-orb-teal pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_90%,color-mix(in_oklab,var(--color-teal)_12%,transparent),transparent_50%)]"
        style={{ animationDuration: "24s" }}
      />

      {TICK_MARKS.map((tick) => (
        <span
          key={tick.left}
          aria-hidden
          className={cn(
            "page-hero-tick pointer-events-none absolute w-px rounded-full bg-gold/50",
            tick.delayClass,
          )}
          style={{ left: tick.left, bottom: tick.bottom, height: tick.height }}
        />
      ))}

      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[70%] w-[min(72%,42rem)] text-gold/10"
        viewBox="0 0 640 280"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          className="page-hero-chart-primary"
          d="M0 220 C80 200 120 120 200 140 S320 80 400 100 S520 40 640 60"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="page-hero-chart-secondary"
          d="M0 250 C100 230 160 180 260 190 S400 150 520 160 S600 120 640 130"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
      </svg>

      <div
        aria-hidden
        className="page-hero-accent-bar pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-b from-transparent via-gold/50 to-transparent"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-background to-transparent"
      />
    </>
  );
}

function HeroEyebrow({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-linear-to-r from-transparent to-gold/50" aria-hidden />
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold">{children}</p>
      <span className="h-px w-8 bg-linear-to-l from-transparent to-gold/50" aria-hidden />
    </div>
  );
}

export function PublicPageHero({
  eyebrow,
  title,
  description,
  children,
  className,
  panel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /** Full-width panel rendered inside the hero (e.g. mentor lessons page). */
  panel?: React.ReactNode;
}) {
  const hasTitle = title.trim().length > 0;

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-slate-brand",
        panel
          ? "flex min-h-[20rem] flex-col justify-end sm:min-h-[22rem] lg:min-h-[26rem]"
          : "flex min-h-[16rem] flex-col justify-end sm:min-h-[18rem] lg:min-h-[20rem]",
        className,
      )}
    >
      <HeroBackdrop />

      {panel ? (
        <div className="relative flex w-full flex-1 flex-col justify-center px-4 pb-10 pt-14 sm:px-8 sm:pb-12 lg:px-12 xl:px-16">
          {panel}
        </div>
      ) : (
        <div className="relative w-full px-4 pb-10 pt-8 sm:px-6 sm:pb-12 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {eyebrow ? (
              <div className="mb-4">
                <HeroEyebrow>{eyebrow}</HeroEyebrow>
              </div>
            ) : null}

            {hasTitle ? (
              <>
                <div className="shimmer-bar mb-5 h-0.5 w-16 rounded-full bg-gold/70" aria-hidden />
                <h1 className="max-w-4xl text-balance text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                  {title}
                </h1>
              </>
            ) : null}

            {description ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-300/90 sm:text-lg">
                {description}
              </p>
            ) : null}

            {children ? <div className="mt-6">{children}</div> : null}

            <div className="mt-8 flex items-center gap-2" aria-hidden>
              <span className="h-1 w-1 rounded-full bg-gold/60" />
              <span className="h-px w-12 bg-white/10" />
              <span className="h-1.5 w-1.5 rounded-full bg-teal/50" />
              <span className="h-px w-8 bg-white/10" />
              <span className="h-1 w-1 rounded-full bg-gold/40" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function PublicPageMain({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </main>
  );
}
