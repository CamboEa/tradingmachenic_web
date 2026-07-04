export const UNCATEGORIZED_LESSON_TOPIC = "__uncategorized__";

export function mentorLessonsHref(
  mentorSlug?: string | null,
  topicSlug?: string | null,
): string {
  if (!mentorSlug) return "/admin/mentors";
  const params = new URLSearchParams({ tab: "lessons" });
  if (topicSlug) params.set("topic", topicSlug);
  return `/admin/mentors/edit/${encodeURIComponent(mentorSlug)}?${params}`;
}

export function lessonCountForMentor(
  lessons: { mentorSlug?: string }[],
  mentorSlug: string,
): number {
  return lessons.filter((lesson) => lesson.mentorSlug === mentorSlug).length;
}
