import Image from "next/image";
import Link from "next/link";

import { CategoryIcon } from "@/components/education/category-icon";
import type { EducationCategory } from "@/lib/education-categories";
import { categoryNavKeys } from "@/lib/education-category-meta";
import type { Dictionary, Locale } from "@/lib/i18n";
import { educationMentorHref, type Mentor } from "@/lib/mentors";

export function MentorCard({
  mentor,
  category,
  locale,
  dict,
  lessonCount,
}: {
  mentor: Mentor;
  category: EducationCategory;
  locale: Locale;
  dict: Dictionary;
  lessonCount: number;
}) {
  const href = educationMentorHref(locale, category, mentor.slug);
  const name = mentor.names[locale];
  const title = mentor.titles[locale];
  const bio = mentor.bios[locale];
  const categoryLabel = dict.nav[categoryNavKeys[category]];
  const countLabel = dict.course.lessonCount.replace("{count}", String(lessonCount));
  const ctaLabel = dict.course.mentorLessons.replace("{mentor}", name);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-bridge/40 bg-surface shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-gold/45 hover:shadow-md hover:shadow-teal/8">
      <Link
        href={href}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-surface-soft">
          {mentor.imageUrl ? (
            <Image
              src={mentor.imageUrl}
              alt={name}
              fill
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.05]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-surface-soft to-bridge/30 text-3xl font-bold text-teal/35">
              {name.charAt(0)}
            </div>
          )}

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/5"
          />

          <div className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3">
            <span className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-black/45 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
              <CategoryIcon category={category} className="h-3 w-3 text-gold" />
              {dict.course.mentorBadge}
            </span>
          </div>

          <div className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3">
            <span className="rounded-md border border-white/15 bg-black/45 px-2 py-0.5 text-[9px] font-semibold tabular-nums text-white backdrop-blur-sm">
              {countLabel}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gold/90">
              {categoryLabel}
            </p>
            <h3 className="mt-0.5 text-base font-bold tracking-tight text-white sm:text-lg">
              {name}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-white/75">{title}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-3.5 sm:p-4">
          <p className="line-clamp-2 text-xs leading-relaxed text-ink-soft">{bio}</p>

          <div className="mt-auto flex items-center justify-end border-t border-bridge/30 pt-3">
            <span className="flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold text-teal ring-1 ring-teal/30 transition-all group-hover:bg-teal group-hover:text-white group-hover:ring-transparent">
              {ctaLabel}
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
