import type { EducationCategory } from "@/lib/education/categories";
import type { Locale } from "@/lib/i18n";

export type Mentor = {
  slug: string;
  names: Record<Locale, string>;
  titles: Record<Locale, string>;
  bios: Record<Locale, string>;
  imageUrl: string;
  categories: EducationCategory[];
};

export function mentorTeachesCategory(
  mentor: Mentor,
  category: EducationCategory,
): boolean {
  return mentor.categories.includes(category);
}

export function educationMentorHref(
  locale: Locale,
  category: EducationCategory,
  mentorSlug: string,
): string {
  return `/${locale}/education/${category}/${mentorSlug}`;
}

export function educationMentorTopicHref(
  locale: Locale,
  category: EducationCategory,
  mentorSlug: string,
  topicSlug: string,
): string {
  return `/${locale}/education/${category}/${mentorSlug}/${topicSlug}`;
}
