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
    <div className="flex min-h-[18rem] flex-col justify-center sm:min-h-[20rem] lg:min-h-[24rem]">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-px w-10 bg-linear-to-r from-transparent to-gold/60" aria-hidden />
        <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-gold">
          {categoryLabel}
        </p>
        <span className="h-px flex-1 max-w-24 bg-linear-to-r from-gold/30 to-transparent" aria-hidden />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">
        <div className="relative mx-auto h-44 w-44 shrink-0 overflow-hidden rounded-2xl ring-2 ring-gold/30 shadow-2xl shadow-black/40 sm:mx-0 sm:h-52 sm:w-52 lg:h-60 lg:w-60">
          {mentor.imageUrl ? (
            <Image
              src={mentor.imageUrl}
              alt={mentorName}
              fill
              className="object-cover object-top"
              sizes="(max-width:640px) 176px, 240px"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-teal/40 text-3xl font-semibold text-white/70">
              {mentorName.charAt(0)}
            </div>
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent"
          />
        </div>

        <div className="min-w-0 flex-1 text-center lg:text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-teal/80">
            {dict.course.mentorBadge}
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            {mentorName}
          </h1>
          <p className="mt-2 text-base text-slate-300 sm:text-lg">{mentorTitle}</p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
            <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              <CategoryIcon category={category} className="h-4 w-4 text-gold" />
              {categoryLabel}
            </span>
            <span className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold tabular-nums text-slate-200 backdrop-blur-sm">
              {countLabel}
            </span>
          </div>

          <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base lg:mx-0 lg:line-clamp-4">
            {mentor.bios[locale]}
          </p>
        </div>
      </div>
    </div>
  );
}
