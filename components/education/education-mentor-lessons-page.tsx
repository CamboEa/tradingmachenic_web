import Image from "next/image";

import { EducationBreadcrumb } from "@/components/education/education-breadcrumb";
import { EducationMentorTopicPicker } from "@/components/education/education-mentor-topic-picker";
import { PublicPageHero, PublicPageMain } from "@/components/ui";
import { educationCategoryHref } from "@/lib/education/categories";
import type { EducationCategory } from "@/lib/education/categories";
import { getCategoryHeaderImage } from "@/lib/education/category-theme";
import { categoryNavKeys } from "@/lib/education/category-meta";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Mentor } from "@/lib/education/mentors";
import type { LessonTopic } from "@/lib/supabase/lesson-topics";

export function EducationMentorLessonsPage({
  category,
  mentor,
  locale,
  dict,
  topics,
}: {
  category: EducationCategory;
  mentor: Mentor;
  locale: Locale;
  dict: Dictionary;
  topics: Array<{ topic: LessonTopic; lessonCount: number; thumbnail: string | null }>;
}) {
  const categoryHref = educationCategoryHref(locale, category);
  const categoryLabel = dict.nav[categoryNavKeys[category]];
  const mentorName = mentor.names[locale];
  const mentorTitle = mentor.titles[locale];
  const mentorBio = mentor.bios[locale];

  const totalLessons = topics.reduce((sum, { lessonCount }) => sum + lessonCount, 0);

  return (
    <div className="flex flex-col">
      <PublicPageHero
        title={mentorName}
        backgroundImage={getCategoryHeaderImage(category)}
        panel={
          <div className="mx-auto w-full max-w-7xl">
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
              {categoryLabel}
            </p>
            <div className="flex items-start gap-5 sm:gap-6">
              {mentor.imageUrl ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white/20 sm:h-20 sm:w-20">
                  <Image
                    src={mentor.imageUrl}
                    alt={mentorName}
                    fill
                    className="object-cover object-top"
                    sizes="80px"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10 text-2xl font-bold text-white sm:h-20 sm:w-20">
                  {mentorName.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
                  {mentorName}
                </h1>
                {mentorTitle ? (
                  <p className="mt-1.5 text-sm font-medium text-teal">{mentorTitle}</p>
                ) : null}
                {mentorBio ? (
                  <p className="mt-3 max-w-2xl line-clamp-2 text-sm leading-relaxed text-slate-100/80">
                    {mentorBio}
                  </p>
                ) : null}
                <p className="mt-3 text-xs font-semibold text-white/50">
                  {topics.length} {topics.length === 1 ? "topic" : "topics"} · {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
                </p>
              </div>
            </div>
          </div>
        }
      />

      <PublicPageMain className="pb-16">
        <EducationBreadcrumb href={categoryHref} label={categoryLabel} />

        <EducationMentorTopicPicker
          category={category}
          mentorSlug={mentor.slug}
          locale={locale}
          dict={dict}
          topics={topics}
        />
      </PublicPageMain>
    </div>
  );
}
