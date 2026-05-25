import { cn } from "@/lib/ui/cn";

const variants = {
  published: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80",
  draft: "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80",
  warning: "bg-amber-100 text-amber-800 ring-1 ring-amber-200/80",
  gold: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80",
  teal: "bg-sky-100 text-sky-800 ring-1 ring-sky-200/80",
  neutral: "bg-slate-100 text-slate-600",
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
