import { notFound } from "next/navigation";

import { EducationCategoryPage } from "@/components/education/education-category-page";
import { getAllLessons } from "@/lib/supabase/lessons";
import { getMentorsByCategory } from "@/lib/supabase/mentors";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import type { EducationCategory } from "@/lib/education-categories";

async function renderCategoryPage(locale: Locale, category: EducationCategory) {
  const [dict, lessons, mentors] = await Promise.all([
    getDictionary(locale),
    getAllLessons(),
    getMentorsByCategory(category),
  ]);

  return (
    <EducationCategoryPage
      category={category}
      locale={locale}
      dict={dict}
      lessons={lessons}
      mentors={mentors}
    />
  );
}

type PageProps = { params: Promise<{ locale: string }> };

export function createEducationCategoryPage(category: EducationCategory) {
  return async function Page({ params }: PageProps) {
    const { locale: raw } = await params;
    if (!isLocale(raw)) notFound();
    return renderCategoryPage(raw as Locale, category);
  };
}
