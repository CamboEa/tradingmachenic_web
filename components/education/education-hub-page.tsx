import { PublicPageHero, PublicPageMain } from "@/components/ui";
import { educationCategorySlugs } from "@/lib/education-categories";
import { educationHubHeaderImage } from "@/lib/education-category-theme";
import type { Dictionary, Locale } from "@/lib/i18n";

import { CategoryCard } from "./category-card";

export function EducationHubPage({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <div className="flex flex-col">
      <PublicPageHero
        eyebrow={dict.nav.education}
        title={dict.course.hubTitle}
        description={dict.course.hubIntro}
        backgroundImage={educationHubHeaderImage}
      />
      <PublicPageMain className="pb-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {educationCategorySlugs.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              locale={locale}
              dict={dict}
            />
          ))}
        </div>
      </PublicPageMain>
    </div>
  );
}
