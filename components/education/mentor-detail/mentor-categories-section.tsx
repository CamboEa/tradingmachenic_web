import { ButtonLink, Card } from "@/components/ui";
import {
  addLessonHref,
  categoryLabels,
} from "@/components/education/mentor-detail/mentor-detail-config";
import { adminLessonTopicsHref } from "@/lib/admin-lessons-nav";
import type { EducationCategory } from "@/lib/education-categories";
import type { AdminMentor } from "@/lib/supabase/mentors";

type MentorCategoriesSectionProps = {
  mentor: AdminMentor;
  lessonCountByCategory: ReadonlyMap<EducationCategory, number>;
};

export function MentorCategoriesSection({
  mentor,
  lessonCountByCategory,
}: MentorCategoriesSectionProps) {
  return (
    <section>
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">Categories</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Edit the mentor profile above to change these market categories.
            </p>
          </div>
          <ButtonLink href={adminLessonTopicsHref(mentor.slug)}>Manage topics</ButtonLink>
        </div>

        <div className="mt-5 space-y-3">
          {mentor.categories.length > 0 ? (
            mentor.categories.map((category) => {
              const lessonCount = lessonCountByCategory.get(category) ?? 0;

              return (
                <div
                  key={category}
                  className="flex items-center justify-between gap-3 rounded-xl border border-bridge/30 bg-surface-soft/50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{categoryLabels[category]}</p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ButtonLink
                    href={addLessonHref({ mentorSlug: mentor.slug, category })}
                    className="shrink-0"
                  >
                    + Add lesson
                  </ButtonLink>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-ink-soft">
              No categories selected yet. Add one in the mentor profile form first.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
