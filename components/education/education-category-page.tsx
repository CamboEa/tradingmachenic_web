import { PublicPageHero } from "@/components/ui";
import type { EducationCategory } from "@/lib/education-categories";
import { categoryNavKeys } from "@/lib/education-category-meta";
import { getCategoryHeaderImage } from "@/lib/education-category-theme";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Lesson } from "@/lib/course";
import type { Mentor } from "@/lib/mentors";

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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicPageHero
        title={label}
        description={dict.course.categoryMentorsIntro}
        backgroundImage={getCategoryHeaderImage(category)}
      />
      <main className="mx-auto w-full max-w-none flex-1 px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
        <MentorGrid
          category={category}
          locale={locale}
          dict={dict}
          lessons={lessons}
          mentors={mentors}
        />
      </main>
    </div>
  );
}
