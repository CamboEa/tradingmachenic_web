import { CourseLessonCard } from "@/components/education/course-lesson-card";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Lesson } from "@/lib/education/course";

export function EducationLessonList({
  lessons,
  locale,
  dict,
  emptyMessage,
}: {
  lessons: Lesson[];
  locale: Locale;
  dict: Dictionary;
  emptyMessage: string;
}) {
  if (lessons.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-bridge/50 bg-surface py-20 text-center">
        <p className="text-sm text-ink-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {lessons.map((lesson, index) => (
        <CourseLessonCard
          key={lesson.slug}
          lesson={lesson}
          locale={locale}
          index={index}
          dict={dict}
        />
      ))}
    </div>
  );
}
