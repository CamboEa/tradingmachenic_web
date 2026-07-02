/**
 * Maps YouTube grouping keys / lesson slugs to admin lesson topic slugs.
 * Keep in sync with seed-thun-tula-mentor.mjs and SQL backfill migrations.
 */
import type { Lesson } from "@/lib/education/course";
import { sortLessonsByDisplayOrder } from "@/lib/education/lessons-sort";
import type { LessonTopic } from "@/lib/supabase/lesson-topics";

export function deriveTopicSlugFromGroupKey(groupKey: string): string {
  const key = groupKey.toLowerCase();

  if (key.includes("csnr")) return "csnr";
  if (key.includes("crt")) return "crt";
  if (key.startsWith("lecture-")) return "lecture-series";
  if (
    key.includes("ict") ||
    key.includes("mentorship") ||
    key.includes("ipda") ||
    key.includes("smt") ||
    key.includes("discord")
  ) {
    return "ict";
  }
  if (
    key.includes("execution") ||
    key.includes("psychology") ||
    key.includes("payout") ||
    key.includes("topstep")
  ) {
    return "execution";
  }

  return "general";
}

export function deriveTopicSlugFromLessonSlug(
  mentorSlug: string,
  lessonSlug: string,
): string {
  const prefix = `${mentorSlug}-`;
  const seriesKey = lessonSlug.startsWith(prefix)
    ? lessonSlug.slice(prefix.length)
    : lessonSlug;

  return deriveTopicSlugFromGroupKey(seriesKey);
}

export function resolveLessonTopicSlug(lesson: Lesson, mentorSlug: string): string {
  return (
    lesson.lessonTopicSlug ?? deriveTopicSlugFromLessonSlug(mentorSlug, lesson.slug)
  );
}

export function filterLessonsByTopic(
  lessons: Lesson[],
  mentorSlug: string,
  topicSlug: string,
): Lesson[] {
  return sortLessonsByDisplayOrder(
    lessons.filter(
      (lesson) => resolveLessonTopicSlug(lesson, mentorSlug) === topicSlug,
    ),
  );
}

export function topicsWithLessonCounts(
  topics: LessonTopic[],
  lessons: Lesson[],
  mentorSlug: string,
): Array<{ topic: LessonTopic; lessonCount: number; thumbnail: string | null }> {
  // 1. Gather all existing topic slugs
  const validTopicSlugs = new Set(topics.map((t) => t.slug));

  // 2. See if there are any lessons that resolve to an unknown topic
  const hasUnmappedLessons = lessons.some((l) => {
    const rawSlug = resolveLessonTopicSlug(l, mentorSlug);
    return !validTopicSlugs.has(rawSlug);
  });

  // 3. If there are unmapped lessons, inject the synthetic 'general' topic (if not already present)
  const activeTopics = [...topics];
  if (hasUnmappedLessons && !validTopicSlugs.has("general")) {
    activeTopics.push({
      id: "synthetic-general",
      mentorSlug,
      slug: "general",
      names: { en: "General", km: "ទូទៅ" },
      descriptions: { en: "Other lessons for this mentor", km: "មេរៀនផ្សេងៗទៀតសម្រាប់គ្រូនេះ" },
      sortOrder: 9999,
      imageUrl: null,
    });
    validTopicSlugs.add("general"); // Mark as available
  }

  // 4. Map them out
  return activeTopics
    .map((topic) => {
      // For the general topic, we must catch BOTH explicitly general lessons AND unmapped ones
      let topicLessons: Lesson[];
      if (topic.slug === "general") {
        topicLessons = sortLessonsByDisplayOrder(
          lessons.filter((l) => {
            const rawSlug = resolveLessonTopicSlug(l, mentorSlug);
            return rawSlug === "general" || !validTopicSlugs.has(rawSlug);
          })
        );
      } else {
        topicLessons = filterLessonsByTopic(lessons, mentorSlug, topic.slug);
      }

      return {
        topic,
        lessonCount: topicLessons.length,
        thumbnail: topic.imageUrl || (topicLessons.length > 0 ? topicLessons[0].thumbnailUrl : null),
      };
    })
    .filter((entry) => entry.lessonCount > 0);
}
