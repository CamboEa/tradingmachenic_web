import Link from "next/link";

import { addLessonHref } from "@/components/education/mentor-detail/mentor-detail-config";
import { Badge, ButtonLink, Card } from "@/components/ui";
import type { LessonTopic } from "@/lib/supabase/lesson-topics";

type MentorTopicsSectionProps = {
  mentorSlug: string;
  topics: LessonTopic[];
  lessonCountByTopic: ReadonlyMap<string, number>;
};

export function MentorTopicsSection({
  mentorSlug,
  topics,
  lessonCountByTopic,
}: MentorTopicsSectionProps) {
  return (
    <section>
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Lesson topics</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Use topics to organize the mentor&apos;s lessons under each category.
            </p>
          </div>
          <ButtonLink href={`/admin/lessons/topics/add?mentor=${encodeURIComponent(mentorSlug)}`}>
            + Add topic
          </ButtonLink>
        </div>

        <div className="mt-5">
          {topics.length === 0 ? (
            <p className="text-sm text-ink-soft">No topics yet for this mentor.</p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="rounded-xl border border-bridge/30 bg-surface-soft/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{topic.names.en}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">{topic.slug}</p>
                    </div>
                    <Badge variant="neutral">
                      {lessonCountByTopic.get(topic.slug) ?? 0} lessons
                    </Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ButtonLink
                      href={addLessonHref({ mentorSlug, topicSlug: topic.slug })}
                    >
                      + Add lesson
                    </ButtonLink>
                    <Link
                      href={`/admin/lessons/topics/edit/${topic.id}`}
                      className="rounded-lg border border-bridge/40 px-4 py-2 text-sm font-semibold text-teal transition hover:bg-surface"
                    >
                      Edit topic
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
