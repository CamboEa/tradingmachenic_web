import { Eyebrow } from "@/components/ui/eyebrow";
import { Panel } from "@/components/ui/card";
import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

export function AdminPageHeader({
  title,
  description,
  eyebrow = "Admin",
  action,
  className,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <Panel
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <Eyebrow variant="admin">{eyebrow}</Eyebrow>
        <h1 className={cn("mt-2", ui.pageTitle)}>{title}</h1>
        {description ? <p className={ui.pageDesc}>{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </Panel>
  );
}
