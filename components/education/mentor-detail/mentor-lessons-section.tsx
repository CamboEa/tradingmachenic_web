import { addLessonHref } from "@/components/education/mentor-detail/mentor-detail-config";
import { LessonsList } from "@/components/education/lessons-list";
import { ButtonLink, Card } from "@/components/ui";
import type { Lesson } from "@/lib/course";

type MentorLessonsSectionProps = {
  mentorSlug: string;
  lessons: Lesson[];
};

export function MentorLessonsSection({
  mentorSlug,
  lessons,
}: MentorLessonsSectionProps) {
  return (
    <section>
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Lessons</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Add or edit lessons for this mentor without leaving the detail page.
            </p>
          </div>
          <ButtonLink href={addLessonHref({ mentorSlug })}>+ Add lesson</ButtonLink>
        </div>

        {lessons.length === 0 ? (
          <p className="mt-5 text-sm text-ink-soft">No lessons yet for this mentor.</p>
        ) : (
          <div className="mt-5 overflow-hidden rounded-2xl border border-bridge/30">
            <LessonsList lessons={lessons} />
          </div>
        )}
      </Card>
    </section>
  );
}
