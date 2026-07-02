import { PublicPageHero, PublicPageMain } from "@/components/ui";
import { educationCategorySlugs } from "@/lib/education/categories";
import { educationHubHeaderImage } from "@/lib/education/category-theme";
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
    <div className="flex flex-col relative">
      <PublicPageHero
        eyebrow={dict.nav.education}
        title={dict.course.hubTitle}
        description={dict.course.hubIntro}
        backgroundImage={educationHubHeaderImage}
      />
      
      <PublicPageMain className="pb-20 pt-10 relative">
        <div className="bg-grid absolute inset-0 -z-10 opacity-30" />
        
        <div className="mb-10 flex flex-col gap-4 border-b border-bridge/30 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal">
              Trading Academy
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Browse by market
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Choose a market to explore our mentor lineup, structured curriculum, and comprehensive trading mechanics.
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/5 px-3.5 py-1.5 text-xs font-semibold text-teal shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal"></span>
              </span>
              {educationCategorySlugs.length} Markets Available
            </span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:gap-8">
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
