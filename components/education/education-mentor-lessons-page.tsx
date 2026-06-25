import { EducationBreadcrumb } from "@/components/education/education-breadcrumb";
import { EducationLessonList } from "@/components/education/education-lesson-list";
import { PublicPageHero, PublicPageMain } from "@/components/ui";
import { educationCategoryHref } from "@/lib/education-categories";
import type { EducationCategory } from "@/lib/education-categories";
import { getCategoryHeaderImage } from "@/lib/education-category-theme";
import { categoryNavKeys } from "@/lib/education-category-meta";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Lesson } from "@/lib/course";
import type { Mentor } from "@/lib/mentors";

export function EducationMentorLessonsPage({
  category,
  mentor,
  locale,
  dict,
  lessons,
}: {
  category: EducationCategory;
  mentor: Mentor;
  locale: Locale;
  dict: Dictionary;
  lessons: Lesson[];
}) {
  const categoryHref = educationCategoryHref(locale, category);
  const categoryLabel = dict.nav[categoryNavKeys[category]];
  const mentorName = mentor.names[locale];
  const mentorTitle = mentor.titles[locale];

  return (
    <div className="flex flex-col">
      <PublicPageHero
        eyebrow={categoryLabel}
        title={mentorName}
        description={mentorTitle}
        backgroundImage={getCategoryHeaderImage(category)}
      />

      <PublicPageMain className="pb-16">
        <EducationBreadcrumb href={categoryHref} label={categoryLabel} />
        <EducationLessonList
          lessons={lessons}
          locale={locale}
          dict={dict}
          emptyMessage={dict.course.noLessonsForMentor}
        />
      </PublicPageMain>
    </div>
  );
}
