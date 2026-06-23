import { educationCategorySlugs } from "@/lib/education-categories";
import type { Dictionary, Locale } from "@/lib/i18n";

import { CategoryCard } from "./category-card";
import { EDUCATION_HUB_BACKGROUND, EducationPageShell } from "./education-page-shell";

export function EducationHubPage({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <EducationPageShell wide backgroundImage={EDUCATION_HUB_BACKGROUND}>
      <div className="flex flex-col gap-4">
        {educationCategorySlugs.map((category) => (
          <CategoryCard
            key={category}
            category={category}
            locale={locale}
            dict={dict}
          />
        ))}
      </div>
    </EducationPageShell>
  );
}
