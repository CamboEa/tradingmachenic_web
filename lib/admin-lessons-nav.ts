export const UNCATEGORIZED_LESSON_TOPIC = "__uncategorized__";

export function adminLessonsListHref(
  mentorSlug?: string | null,
  topicSlug?: string | null,
): string {
  const params = new URLSearchParams();
  if (mentorSlug) params.set("mentor", mentorSlug);
  if (topicSlug) params.set("topic", topicSlug);
  const query = params.toString();
  return query ? `/admin/lessons?${query}` : "/admin/lessons";
}

/**
 * Where a topic card should take the admin. Topics usually hold a single
 * container lesson whose videos are the real content, so a one-lesson topic
 * jumps straight to that lesson's editor instead of a one-row lessons table.
 */
export function adminTopicHref(
  mentorSlug: string,
  topicSlug: string,
  topicLessons: { slug: string }[],
): string {
  if (topicLessons.length === 1) {
    return `/admin/lessons/edit/${encodeURIComponent(topicLessons[0].slug)}`;
  }
  return adminLessonsListHref(mentorSlug, topicSlug);
}

export function lessonCountForMentor(
  lessons: { mentorSlug?: string }[],
  mentorSlug: string,
): number {
  return lessons.filter((lesson) => lesson.mentorSlug === mentorSlug).length;
}

export function adminLessonTopicsHref(mentorSlug?: string): string {
  if (!mentorSlug) return "/admin/lessons/topics";
  return `/admin/lessons/topics?mentor=${encodeURIComponent(mentorSlug)}`;
}
