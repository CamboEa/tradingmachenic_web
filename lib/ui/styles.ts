/** Shared Tailwind class tokens — logo teal/cyan on black (see globals.css). */
export const ui = {
  /** Primary CTA */
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal/20 transition hover:brightness-110 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 disabled:pointer-events-none disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-bridge/40 bg-surface px-4 py-2.5 text-sm font-semibold text-ink-muted shadow-sm transition hover:border-teal/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 disabled:pointer-events-none disabled:opacity-50",
  btnGhost:
    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-soft hover:text-foreground",
  btnGold:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-highlight px-4 py-2.5 text-sm font-semibold text-background shadow-sm shadow-highlight/20 transition hover:brightness-110",
  btnDanger:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-surface px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10",

  card:
    "rounded-2xl border border-bridge/30 bg-surface/90 shadow-sm shadow-black/20 backdrop-blur-sm transition",
  cardHover: "hover:-translate-y-0.5 hover:shadow-md hover:shadow-black/30",
  cardSolid:
    "rounded-2xl border border-bridge/40 bg-surface shadow-sm shadow-black/20",
  panel:
    "rounded-[1.75rem] border border-bridge/30 bg-surface/85 p-6 shadow-sm shadow-black/20 backdrop-blur-sm sm:p-8",

  field:
    "w-full rounded-xl border border-bridge/40 bg-surface-soft/80 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-ink-soft focus:border-teal focus:bg-surface focus:ring-2 focus:ring-teal/20",

  eyebrowPublic: "text-xs font-bold uppercase tracking-[0.25em] text-highlight",
  eyebrowAdmin: "text-xs font-semibold uppercase tracking-[0.2em] text-highlight",
  pageTitle: "text-2xl font-bold tracking-tight text-foreground sm:text-3xl",
  pageTitlePublic:
    "text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl",
  pageDesc: "mt-2 text-sm leading-6 text-ink-soft",
  sectionLabel:
    "text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft",

  linkCard:
    "group flex flex-col overflow-hidden rounded-2xl border border-bridge/40 bg-surface shadow-sm shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-teal/25 hover:shadow-lg hover:shadow-black/30",

  /** Data tables (admin lists) */
  tableHeadRow:
    "border-b border-bridge/40 bg-surface-soft/70 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft",
  tableTh: "whitespace-nowrap px-4 py-3 font-semibold",
  tableRow: "transition-colors hover:bg-surface-soft/70",
  tableTd: "px-4 py-3 align-middle text-ink-muted",

  /** Compact square icon buttons for table row actions */
  iconBtn:
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-bridge/40 bg-surface text-ink-soft transition hover:border-teal/40 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 disabled:pointer-events-none disabled:opacity-50",
  iconBtnDanger:
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-bridge/40 bg-surface text-ink-soft transition hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:pointer-events-none disabled:opacity-50",
} as const;

/** Form inputs (admin forms) */
export const FIELD_CLASS = ui.field;
