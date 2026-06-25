import { cn } from "@/lib/ui/cn";

const variants = {
  published: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
  draft: "bg-surface-soft text-ink-muted ring-1 ring-bridge/40",
  warning: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
  gold: "bg-gold/15 text-gold ring-1 ring-gold/30",
  teal: "bg-teal/15 text-teal ring-1 ring-teal/30",
  neutral: "bg-surface-soft text-ink-muted",
} as const;

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
