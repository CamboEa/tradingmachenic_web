import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

export function PublicPageHero({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-slate-brand px-4 py-14 sm:px-6 sm:py-16 lg:px-8",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(212,175,55,0.18),transparent_24rem),radial-gradient(circle_at_86%_10%,rgba(14,165,233,0.2),transparent_26rem)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl">
        <Eyebrow variant="public">{eyebrow}</Eyebrow>
        <h1 className={cn("mt-3 max-w-3xl", ui.pageTitlePublic)}>{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{description}</p>
        ) : null}
        {children ? <div className="mt-6">{children}</div> : null}
      </div>
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
