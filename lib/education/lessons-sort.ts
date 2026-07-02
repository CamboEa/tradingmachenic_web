import type { Lesson } from "@/lib/education/course";
import { thunTulaLessonOrderIndex } from "@/lib/education/thun-tula-playlist-order";

export function sortLessonsByDisplayOrder(lessons: Lesson[]): Lesson[] {
  return [...lessons].sort((a, b) => {
    if (a.mentorSlug === "thun-tula-ft" && b.mentorSlug === "thun-tula-ft") {
      const slugOrderA = thunTulaLessonOrderIndex(a.slug);
      const slugOrderB = thunTulaLessonOrderIndex(b.slug);
      if (slugOrderA !== slugOrderB) return slugOrderA - slugOrderB;
    }

    const orderA = a.sortOrder ?? 0;
    const orderB = b.sortOrder ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.titles.en.localeCompare(b.titles.en);
  });
}
