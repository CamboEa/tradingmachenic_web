import { notFound } from "next/navigation";

import { EducationLessonGrid } from "@/components/education/education-lesson-grid";
import { PublicPageHero, PublicPageMain } from "@/components/ui";
import { getAllLessons } from "@/lib/supabase/lessons";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function EducationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const [dict, lessons] = await Promise.all([
    getDictionary(locale),
    getAllLessons(),
  ]);

  return (
    <div className="flex flex-col">
      <PublicPageHero
        eyebrow={dict.nav.education}
        title={dict.course.title}
        description={dict.course.intro}
      />
      <PublicPageMain>
        <EducationLessonGrid lessons={lessons} locale={locale} dict={dict} />
      </PublicPageMain>
    </div>
  );
}
