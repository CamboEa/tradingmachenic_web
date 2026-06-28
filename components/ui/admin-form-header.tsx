import Link from "next/link";

import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

export function AdminBackLink({
  href,
  label = "Back",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Link href={href} className={cn(ui.btnSecondary, "shrink-0 px-3.5 py-2")}>
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
      </svg>
      {label}
    </Link>
  );
}

export function AdminFormHeader({
  backHref,
  backLabel,
  title,
  description,
  meta,
}: {
  backHref: string;
  backLabel?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
      <AdminBackLink href={backHref} label={backLabel} />
      <div className="min-w-0 flex-1">
        <h1 className={ui.pageTitle}>{title}</h1>
        {description ? (
          <p className={cn(ui.pageDesc, "mt-1")} title={description}>
            {description}
          </p>
        ) : null}
        {meta ? <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
    </div>
  );
}
