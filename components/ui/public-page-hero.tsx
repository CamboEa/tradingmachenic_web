import Image from "next/image";

import { cn } from "@/lib/ui/cn";

const TICK_MARKS = [
  { left: "18%", bottom: "22%", height: "1.25rem", delayClass: "" },
  { left: "34%", bottom: "18%", height: "2rem", delayClass: "page-hero-tick-2" },
  { left: "52%", bottom: "26%", height: "1.5rem", delayClass: "page-hero-tick-3" },
  { left: "71%", bottom: "20%", height: "2.25rem", delayClass: "page-hero-tick-4" },
] as const;

function HeroBackdrop({ photo }: { photo?: boolean }) {
  return (
    <>
      <div
        aria-hidden
        className={cn(
          "page-hero-grid pointer-events-none absolute inset-0",
          photo ? "opacity-[0.06]" : "opacity-[0.12]"
        )}
        style={{
          backgroundImage: [
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 56px)",
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 48px)",
          ].join(","),
        }}
      />

      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,color-mix(in_oklab,var(--color-gold)_12%,transparent),transparent_34%),linear-gradient(300deg,color-mix(in_oklab,var(--color-teal)_14%,transparent),transparent_38%)]",
          photo && "opacity-40"
        )}
      />

      {TICK_MARKS.map((tick) => (
        <span
          key={tick.left}
          aria-hidden
          className={cn(
            "page-hero-tick pointer-events-none absolute w-px rounded-full bg-gold/50",
            tick.delayClass,
            photo && "opacity-50"
          )}
          style={{ left: tick.left, bottom: tick.bottom, height: tick.height }}
        />
      ))}

      <svg
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-0 right-0 h-[70%] w-[min(72%,42rem)]",
          photo ? "text-gold/5" : "text-gold/10"
        )}
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
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-slate-brand to-transparent"
      />
    </>
  );
}

function HeroPhotoLayer({ src }: { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      fill
      priority
      sizes="100vw"
      aria-hidden
      className="object-cover object-center"
    />
  );
}

function HeroEyebrow({ children }: { children: string }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-(--color-gold)">{children}</p>
  );
}

export function PublicPageHero({
  eyebrow,
  title,
  description,
  children,
  className,
  panel,
  backgroundImage,
  /** Show only the background image (copy is baked into the artwork). */
  imageOnly,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  /** Full-width panel rendered inside the hero (e.g. mentor lessons page). */
  panel?: React.ReactNode;
  /** Optional wide photo banner behind the hero copy. */
  backgroundImage?: string;
  imageOnly?: boolean;
}) {
  const hasTitle = title.trim().length > 0;
  const hasPhoto = Boolean(backgroundImage);
  const showImageOnly = imageOnly && hasPhoto;

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        hasPhoto ? "bg-background" : "bg-slate-brand",
        showImageOnly
          ? "flex min-h-[16rem] flex-col justify-end sm:min-h-[18rem] lg:min-h-[20rem]"
          : panel
            ? "flex min-h-[20rem] flex-col justify-end sm:min-h-[22rem] lg:min-h-[26rem]"
            : "flex min-h-[16rem] flex-col justify-end sm:min-h-[18rem] lg:min-h-[20rem]",
        className,
      )}
    >
      {backgroundImage ? <HeroPhotoLayer src={backgroundImage} /> : null}
      {backgroundImage && !showImageOnly ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(30,41,59,0.78),rgba(30,41,59,0.50)_45%,rgba(30,41,59,0.30)),linear-gradient(0deg,rgba(30,41,59,0.65),rgba(30,41,59,0.10)_55%)]"
        />
      ) : null}
      <HeroBackdrop photo={hasPhoto} />

      {showImageOnly ? (
        hasTitle ? <h1 className="sr-only">{title}</h1> : null
      ) : panel ? (
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
              <h1 className="max-w-4xl text-balance text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                {title}
              </h1>
            ) : null}

            {description ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-100/90 sm:text-lg">
                {description}
              </p>
            ) : null}

            {children ? <div className="mt-6">{children}</div> : null}
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
