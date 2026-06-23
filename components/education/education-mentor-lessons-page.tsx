import { CourseLessonCard } from "@/components/education/course-lesson-card";
import { MentorLessonsHeroPanel } from "@/components/education/mentor-lessons-page-header";
import { PublicPageHero } from "@/components/ui";
import type { EducationCategory } from "@/lib/education-categories";
import { getCategoryHeaderImage } from "@/lib/education-category-theme";
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
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicPageHero
        title=""
        backgroundImage={getCategoryHeaderImage(category)}
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

      <main className="mx-auto w-full max-w-none flex-1 px-4 pb-10 pt-8 sm:px-8 lg:px-12 xl:px-16">
        {lessons.length === 0 ? (
          <div className="rounded-xl border border-dashed border-bridge/50 bg-white py-16 text-center">
            <p className="text-sm text-ink-muted">{dict.course.noLessonsForMentor}</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {lessons.map((lesson, index) => (
              <CourseLessonCard
                key={lesson.slug}
                lesson={lesson}
                locale={locale}
                index={index}
                total={lessons.length}
                dict={dict}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
