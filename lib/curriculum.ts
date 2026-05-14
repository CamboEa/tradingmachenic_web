import type { Locale } from "./i18n";

/** One module (week) in the curriculum timeline. */
export type CurriculumWeek = {
  titles: Record<Locale, string>;
  focus: Record<Locale, string>;
  activities: Record<Locale, string[]>;
};

/** Visual lane for the public curriculum timeline. */
export type CurriculumAccent = "gold" | "teal";

/** Phase + nested modules as used by the curriculum page (DB-backed). */
export type CurriculumPhaseWithWeeks = {
  id: string;
  slug: string;
  accent: CurriculumAccent;
  sort_order: number;
  label_en: string;
  label_km: string;
  sublabel_en: string;
  sublabel_km: string;
  weeks: (CurriculumWeek & { id: string })[];
};
