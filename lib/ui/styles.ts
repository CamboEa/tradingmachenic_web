/** Shared Tailwind class tokens — Structured Clarity palette (AGENTS.md). */
export const ui = {
  /** Primary CTA */
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-teal/20 transition hover:bg-sky-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 disabled:pointer-events-none disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal/30 hover:text-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 disabled:pointer-events-none disabled:opacity-50",
  btnGhost:
    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900",
  btnGold:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-slate-brand shadow-sm transition hover:brightness-95",
  btnDanger:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50",

  card:
    "rounded-2xl border border-white/80 bg-white/90 shadow-sm shadow-slate-900/5 backdrop-blur-sm transition",
  cardHover: "hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/8",
  cardSolid:
    "rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/5",
  panel:
    "rounded-[1.75rem] border border-white/80 bg-white/85 p-6 shadow-sm shadow-slate-900/5 backdrop-blur-sm sm:p-8",

  field:
    "w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal focus:bg-white focus:ring-2 focus:ring-teal/20",

  eyebrowPublic: "text-xs font-bold uppercase tracking-[0.25em] text-gold",
  eyebrowAdmin: "text-xs font-semibold uppercase tracking-[0.2em] text-gold",
  pageTitle: "text-2xl font-bold tracking-tight text-slate-brand sm:text-3xl",
  pageTitlePublic:
    "text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl",
  pageDesc: "mt-2 text-sm leading-6 text-slate-500",
  sectionLabel:
    "text-xs font-semibold uppercase tracking-[0.2em] text-slate-400",

  linkCard:
    "group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/5 transition duration-300 hover:-translate-y-1 hover:border-teal/25 hover:shadow-lg hover:shadow-slate-900/10",
} as const;

/** Form inputs (admin forms) */
export const FIELD_CLASS = ui.field;
