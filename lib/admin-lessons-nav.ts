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
