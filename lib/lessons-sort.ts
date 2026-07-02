import type { Lesson } from "@/lib/course";

export function sortLessonsByDisplayOrder(lessons: Lesson[]): Lesson[] {
  return [...lessons].sort((a, b) => {
    const orderA = a.sortOrder ?? 0;
    const orderB = b.sortOrder ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.titles.en.localeCompare(b.titles.en);
  });
}
