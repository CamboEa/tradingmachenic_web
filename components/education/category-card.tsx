import Image from "next/image";
import Link from "next/link";

import type { EducationCategory } from "@/lib/education-categories";
import { educationCategoryHref } from "@/lib/education-categories";
import { categoryHintKeys, categoryNavKeys } from "@/lib/education-category-meta";
import { getCategoryImage, getCategoryTheme } from "@/lib/education-category-theme";
import type { Dictionary, Locale } from "@/lib/i18n";
import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

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
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-bridge bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-teal/40 hover:shadow-xl hover:shadow-teal/10",
        "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40",
      )}
    >
      <div className="relative aspect-[2/1] overflow-hidden bg-surface-soft sm:aspect-[16/9]">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-brand/90 via-slate-brand/20 to-transparent" />
        
        <div className="absolute top-4 right-4 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold backdrop-blur-md shadow-sm">
           {theme.tagline}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-teal/80 to-teal/10 transform scale-x-0 transition-transform duration-500 origin-left group-hover:scale-x-100" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h2 className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-teal sm:text-2xl">
          {label}
        </h2>
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-muted">
          {hint}
        </p>
        <div className="mt-6 flex items-center justify-between border-t border-bridge/30 pt-4">
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition-colors group-hover:text-teal/80">
            {dict.course.exploreCategory}
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
              <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
            </svg>
          </p>
        </div>
      </div>
    </Link>
  );
}
