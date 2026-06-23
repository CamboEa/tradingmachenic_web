import { notFound } from "next/navigation";

import { EducationMentorLessonsPage } from "@/components/education/education-mentor-lessons-page";
import type { EducationCategory } from "@/lib/education-categories";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { mentorTeachesCategory } from "@/lib/mentors";
import { getLessonsByMentorAndCategory } from "@/lib/supabase/lessons";
import { getMentorBySlug } from "@/lib/supabase/mentors";

type PageProps = {
  params: Promise<{ locale: string; mentorSlug: string }>;
};

export function createEducationMentorPage(category: EducationCategory) {
  return async function Page({ params }: PageProps) {
    const { locale: raw, mentorSlug } = await params;
    if (!isLocale(raw)) notFound();
    const locale = raw as Locale;

    const mentor = await getMentorBySlug(mentorSlug);
    if (!mentor || !mentorTeachesCategory(mentor, category)) notFound();

    const [dict, lessons] = await Promise.all([
      getDictionary(locale),
      getLessonsByMentorAndCategory(mentorSlug, category),
    ]);

    return (
      <EducationMentorLessonsPage
        category={category}
        mentor={mentor}
        locale={locale}
        dict={dict}
        lessons={lessons}
      />
    );
  };
}
