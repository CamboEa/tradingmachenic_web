import { cn } from "@/lib/ui/cn";

export function PublicPageHero({
  eyebrow,
  title,
  description,
  children,
  className,
  backgroundImage,
  panel,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  backgroundImage?: string;
  /** Full-width panel rendered inside the hero (e.g. mentor lessons page). */
  panel?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-slate-brand",
        panel
          ? "flex min-h-[18rem] flex-col justify-end sm:min-h-[20rem] lg:min-h-[22rem]"
          : "h-64 sm:h-72 lg:h-80",
        className,
      )}
    >
      {backgroundImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={backgroundImage}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
        />
      )}

      {panel ? (
        <div className="relative w-full px-4 pb-6 pt-10 sm:px-8 sm:pb-8 lg:px-12 xl:px-16">
          {panel}
        </div>
      ) : (
        <div className="absolute bottom-0 left-0 right-0 pl-2 pr-4 pb-7 pt-5 sm:pl-4 sm:pr-6 lg:pl-6 lg:pr-8">
          <div className="mx-auto max-w-7xl">
            {eyebrow ? (
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-1 text-sm text-slate-400">{description}</p>
            ) : null}
            {children ? <div className="mt-3">{children}</div> : null}
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
