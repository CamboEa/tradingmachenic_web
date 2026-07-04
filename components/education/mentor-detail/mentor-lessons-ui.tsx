"use client";

import { Badge, Button } from "@/components/ui";
import { ChevronRightIcon, PencilIcon } from "@/components/ui/icons";
import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

export function LessonsBackButton({
  onClick,
  label = "Back",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button type="button" onClick={onClick} className={cn(ui.btnSecondary, "shrink-0 px-3.5 py-2")}>
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
        <path d="M7.78 12.53a.75.75 0 0 1-1.06 0L2.47 8.28a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L4.81 7h7.44a.75.75 0 0 1 0 1.5H4.81l2.97 2.97a.75.75 0 0 1 0 1.06Z" />
      </svg>
      {label}
    </button>
  );
}

export function LessonsPanelHeader({
  eyebrow,
  title,
  description,
  meta,
  action,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className={ui.eyebrowAdmin}>{eyebrow}</p>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground sm:text-xl">
          {title}
        </h2>
        {description ? <p className={cn(ui.pageDesc, "mt-1")}>{description}</p> : null}
        {meta ? <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function LessonsEmptyPanel({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-bridge/40 bg-surface-soft/40 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-ink-muted">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-soft">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function TopicPickerCard({
  title,
  subtitle,
  countLabel,
  onOpen,
  onEdit,
}: {
  title: string;
  subtitle: string;
  countLabel: string;
  onOpen: () => void;
  onEdit?: () => void;
}) {
  return (
    <article
      className={cn(
        ui.card,
        "group flex min-w-0 items-stretch overflow-hidden transition hover:border-teal/30 hover:shadow-md",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal/40"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{title}</p>
          <p className="mt-0.5 truncate text-xs text-ink-soft">{subtitle}</p>
          <div className="mt-2">
            <Badge variant="teal">{countLabel}</Badge>
          </div>
        </div>
        <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-teal" />
      </button>

      {onEdit ? (
        <div className="flex shrink-0 items-center border-l border-bridge/30 bg-surface-soft/40 px-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
            className={ui.iconBtn}
            aria-label={`Edit ${title}`}
            title="Edit topic"
          >
            <PencilIcon />
          </button>
        </div>
      ) : null}
    </article>
  );
}

export function videoCountLabel(count: number): string {
  return count === 1 ? "1 lesson" : `${count} lessons`;
}
