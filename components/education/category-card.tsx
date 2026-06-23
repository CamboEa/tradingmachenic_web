import Image from "next/image";
import Link from "next/link";

import type { EducationCategory } from "@/lib/education-categories";
import { educationCategoryHref } from "@/lib/education-categories";
import { categoryHintKeys, categoryNavKeys } from "@/lib/education-category-meta";
import { getCategoryImage, getCategoryTheme } from "@/lib/education-category-theme";
import type { Dictionary, Locale } from "@/lib/i18n";

export function CategoryCard({
  category,
  locale,
  dict,
}: {
  category: EducationCategory;
  locale: Locale;
  dict: Dictionary;
}) {
  const label = dict.nav[categoryNavKeys[category]];
  const hint = dict.course[categoryHintKeys[category]];
  const href = educationCategoryHref(locale, category);
  const theme = getCategoryTheme(category);
  const imageSrc = getCategoryImage(category);

  return (
    <Link
      href={href}
      className="group flex w-full min-h-[200px] overflow-hidden rounded-xl border border-bridge/40 bg-white shadow-sm transition duration-300 hover:border-gold/50 hover:shadow-lg hover:shadow-teal/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 sm:min-h-[240px] lg:min-h-[280px]"
    >
      <div className="relative hidden w-56 shrink-0 overflow-hidden sm:block md:w-72 lg:w-80 xl:w-96">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="384px"
        />
        <div className="absolute inset-0 bg-teal/40" />
        <div className="absolute inset-y-0 right-0 w-1.5 bg-gold" />
      </div>

      <div className="flex min-w-0 flex-1 items-center p-6 sm:p-8 lg:p-10">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
            {theme.tagline}
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-teal transition group-hover:text-gold sm:text-3xl lg:text-4xl">
            {label}
          </h2>
          <p className="mt-2 line-clamp-2 text-base leading-relaxed text-ink-muted sm:text-lg">
            {hint}
          </p>
        </div>
      </div>
    </Link>
  );
}
