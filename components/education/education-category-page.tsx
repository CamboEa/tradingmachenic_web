import { PublicPageHero, PublicPageMain } from "@/components/ui";
import type { EducationCategory } from "@/lib/education/categories";
import { categoryHintKeys, categoryNavKeys } from "@/lib/education/category-meta";
import { getCategoryTheme, getCategoryHeaderImage } from "@/lib/education/category-theme";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Lesson } from "@/lib/education/course";
import type { Mentor } from "@/lib/education/mentors";

import { EducationBreadcrumb } from "./education-breadcrumb";
import { MentorGrid } from "./mentor-grid";

export function EducationCategoryPage({
  category,
  locale,
  dict,
  lessons,
  mentors,
}: {
  category: EducationCategory;
  locale: Locale;
  dict: Dictionary;
  lessons: Lesson[];
  mentors: Mentor[];
}) {
  const label = dict.nav[categoryNavKeys[category]];
  const hint = dict.course[categoryHintKeys[category]];
  const theme = getCategoryTheme(category);

  return (
    <div className="flex flex-col">
      <PublicPageHero
        eyebrow={theme.tagline}
        title={label}
        description={hint ?? dict.course.categoryMentorsIntro}
        backgroundImage={getCategoryHeaderImage(category)}
      />
      <PublicPageMain className="pb-16">
        <EducationBreadcrumb href={`/${locale}/education`} label={dict.nav.education} />
        <MentorGrid
          category={category}
          locale={locale}
          dict={dict}
          lessons={lessons}
          mentors={mentors}
        />
      </PublicPageMain>
    </div>
  );
}
