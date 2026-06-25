import Link from "next/link";

import { CourseLessonCard } from "@/components/education/course-lesson-card";
import { MentorLessonsHeroPanel } from "@/components/education/mentor-lessons-page-header";
import { PublicPageHero } from "@/components/ui";
import { educationCategoryHref } from "@/lib/education-categories";
import type { EducationCategory } from "@/lib/education-categories";
import { categoryNavKeys } from "@/lib/education-category-meta";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Lesson } from "@/lib/course";
import type { Mentor } from "@/lib/mentors";

export function EducationMentorLessonsPage({
  category,
  mentor,
  locale,
  dict,
  lessons,
}: {
  category: EducationCategory;
  mentor: Mentor;
  locale: Locale;
  dict: Dictionary;
  lessons: Lesson[];
}) {
  const categoryHref = educationCategoryHref(locale, category);
  const mentorName = mentor.names[locale];
  const sectionTitle = dict.course.mentorLessons.replace("{mentor}", mentorName);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicPageHero
        title=""
        className="min-h-[28rem] sm:min-h-[32rem] lg:min-h-[38rem] xl:min-h-[42rem]"
        panel={
          <MentorLessonsHeroPanel
            category={category}
            mentor={mentor}
            locale={locale}
            dict={dict}
            lessonCount={lessons.length}
          />
        }
      />

      <main className="mx-auto w-full max-w-none flex-1 px-4 pb-16 pt-10 sm:px-8 lg:px-12 xl:px-16">
        <p className="mb-8 text-sm">
          <Link
            href={categoryHref}
            className="font-semibold text-teal transition hover:text-gold"
          >
            ← {dict.nav[categoryNavKeys[category]]}
          </Link>
        </p>

        <div className="mb-8 flex flex-col gap-2 border-b border-bridge/40 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold">
              {dict.course.mentorBadge}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {sectionTitle}
            </h2>
          </div>
          {lessons.length > 0 ? (
            <p className="text-sm font-medium tabular-nums text-ink-muted">
              {dict.course.lessonCount.replace("{count}", String(lessons.length))}
            </p>
          ) : null}
        </div>

        {lessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-bridge/50 bg-surface py-24 text-center">
            <p className="text-sm text-ink-muted">{dict.course.noLessonsForMentor}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:gap-8 xl:grid-cols-3">
            {lessons.map((lesson, index) => (
              <CourseLessonCard
                key={lesson.slug}
                lesson={lesson}
                locale={locale}
                index={index}
                dict={dict}
                large
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
