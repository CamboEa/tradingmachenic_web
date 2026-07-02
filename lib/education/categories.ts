import type { Locale } from "@/lib/i18n";

export const educationCategorySlugs = ["forex", "stock", "crypto", "siac"] as const;
export type EducationCategory = (typeof educationCategorySlugs)[number];

export function isEducationCategory(slug: string): slug is EducationCategory {
  return (educationCategorySlugs as readonly string[]).includes(slug);
}

export function educationCategoryHref(locale: Locale, category: EducationCategory): string {
  return `/${locale}/education/${category}`;
}
