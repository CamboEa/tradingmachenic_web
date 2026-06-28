/** Shared Tailwind class tokens based on the Structured Clarity palette. */
export const ui = {
  /** Primary CTA */
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal/20 transition hover:bg-sky-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 disabled:pointer-events-none disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-bridge bg-surface px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:border-teal/40 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 disabled:pointer-events-none disabled:opacity-50",
  btnGhost:
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-soft hover:text-foreground",
  btnGold:
    "inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-slate-brand shadow-sm shadow-gold/20 transition hover:brightness-105",
  btnDanger:
    "inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-surface px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50",

  card:
    "rounded-lg border border-bridge bg-surface shadow-sm transition",
  cardHover: "hover:-translate-y-0.5 hover:border-teal/35 hover:shadow-md",
  cardSolid:
    "rounded-lg border border-bridge bg-surface shadow-sm",
  panel:
    "rounded-lg border border-bridge bg-surface p-6 shadow-sm sm:p-8",

  field:
    "w-full rounded-lg border border-bridge bg-surface px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-ink-soft focus:border-teal focus:ring-2 focus:ring-teal/15",

  eyebrowPublic: "text-xs font-bold uppercase tracking-[0.22em] text-gold",
  eyebrowAdmin: "text-xs font-semibold uppercase tracking-[0.18em] text-teal",
  pageTitle: "text-2xl font-bold tracking-tight text-foreground sm:text-3xl",
  pageTitlePublic:
    "text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl",
  pageDesc: "mt-2 text-sm leading-6 text-ink-soft",
  sectionLabel:
    "text-xs font-semibold uppercase tracking-[0.18em] text-ink-soft",

  linkCard:
    "group flex flex-col overflow-hidden rounded-lg border border-bridge bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal/35 hover:shadow-md",

  /** Data tables (admin lists) */
  tableHeadRow:
    "border-b border-bridge bg-surface-soft text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft",
  tableTh: "whitespace-nowrap px-4 py-3 font-semibold",
  tableRow: "transition-colors hover:bg-surface-soft/70",
  tableTd: "px-4 py-3 align-middle text-ink-muted",

  /** Compact square icon buttons for table row actions */
  iconBtn:
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-bridge bg-surface text-ink-soft transition hover:border-teal/40 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 disabled:pointer-events-none disabled:opacity-50",
  iconBtnDanger:
    "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-bridge bg-surface text-ink-soft transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 disabled:pointer-events-none disabled:opacity-50",
} as const;

/** Form inputs (admin forms) */
export const FIELD_CLASS = ui.field;
