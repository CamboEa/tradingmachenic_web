import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

const accents = {
  gold: "border-l-gold",
  teal: "border-l-teal",
  slate: "border-l-slate-400",
} as const;

export function StatCard({
  label,
  value,
  sub,
  accent = "teal",
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: keyof typeof accents;
}) {
  return (
    <div
      className={cn(
        ui.card,
        ui.cardHover,
        "border-l-4 p-5",
        accents[accent],
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-slate-brand">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-400">{sub}</p> : null}
    </div>
  );
}
