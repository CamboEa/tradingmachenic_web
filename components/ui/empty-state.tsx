import { cn } from "@/lib/ui/cn";
import { ButtonLink } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "ui-empty-state rounded-2xl border border-gold/25 bg-gold/5 px-8 py-14 text-center",
        className,
      )}
    >
      <p className="text-xl font-bold text-foreground sm:text-2xl">{title}</p>
      {description ? (
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft sm:text-base">
          {description}
        </p>
      ) : null}
      {action ? (
        <ButtonLink href={action.href} className="mt-8">
          {action.label}
        </ButtonLink>
      ) : null}
    </div>
  );
}
