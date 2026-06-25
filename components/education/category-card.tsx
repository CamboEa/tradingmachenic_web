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
      className="group flex flex-col overflow-hidden rounded-xl border border-bridge/40 bg-surface shadow-sm transition duration-300 hover:border-highlight/40 hover:shadow-md hover:shadow-teal/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight/40"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-soft">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-teal/30" />
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-highlight" />
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-highlight">
          {theme.tagline}
        </p>
        <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground transition group-hover:text-highlight sm:text-2xl">
          {label}
        </h2>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-muted">
          {hint}
        </p>
        <p className="mt-4 text-sm font-semibold text-teal group-hover:text-highlight">
          {dict.course.exploreCategory}
          <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </p>
      </div>
    </Link>
  );
}
