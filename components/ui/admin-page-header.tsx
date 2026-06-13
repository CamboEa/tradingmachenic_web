import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

export function AdminPageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  /** @deprecated no longer rendered — the top bar shows the section name. */
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className={ui.pageTitle}>{title}</h1>
        {description ? <p className={cn(ui.pageDesc, "mt-1")}>{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}
