import Image from "next/image";

import { CategoryIcon } from "@/components/education/category-icon";
import type { EducationCategory } from "@/lib/education-categories";
import { categoryNavKeys } from "@/lib/education-category-meta";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Mentor } from "@/lib/mentors";

export function MentorLessonsHeroPanel({
  category,
  mentor,
  locale,
  dict,
  lessonCount,
}: {
  category: EducationCategory;
  mentor: Mentor;
  locale: Locale;
  dict: Dictionary;
  lessonCount: number;
}) {
  const categoryLabel = dict.nav[categoryNavKeys[category]];
  const mentorName = mentor.names[locale];
  const mentorTitle = mentor.titles[locale];
  const countLabel = dict.course.lessonCount.replace("{count}", String(lessonCount));

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center lg:gap-8">
        <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-full sm:h-40 sm:w-40 lg:h-44 lg:w-44">
          {mentor.imageUrl ? (
            <Image
              src={mentor.imageUrl}
              alt={mentorName}
              fill
              className="object-cover object-top"
              sizes="176px"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-teal/40 text-2xl font-semibold text-white/70">
              {mentorName.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
            {mentorName}
          </h1>
          <p className="mt-1 text-sm text-slate-300 sm:text-base">{mentorTitle}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              <CategoryIcon category={category} className="h-3.5 w-3.5 text-gold" />
              {categoryLabel}
            </span>
            <span className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold tabular-nums text-slate-200 backdrop-blur-sm">
              {countLabel}
            </span>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
            {mentor.bios[locale]}
          </p>
        </div>
      </div>
    </div>
  );
}
