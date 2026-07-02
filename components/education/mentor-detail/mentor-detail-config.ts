import type { EducationCategory } from "@/lib/education-categories";

export const mentorDetailSections = [
  { id: "mentor-profile", label: "Profile" },
  { id: "mentor-categories", label: "Categories" },
  { id: "mentor-lessons", label: "Lessons" },
  { id: "mentor-topics", label: "Topics" },
] as const;

export type MentorDetailSectionId = (typeof mentorDetailSections)[number]["id"];

export const categoryLabels: Record<EducationCategory, string> = {
  forex: "Forex",
  stock: "Stock",
  crypto: "Crypto",
  siac: "SIAC",
};

export function addLessonHref({
  mentorSlug,
  category,
  topicSlug,
}: {
  mentorSlug: string;
  category?: EducationCategory;
  topicSlug?: string;
}): string {
  const params = new URLSearchParams({ mentor: mentorSlug });
  if (category) params.set("category", category);
  if (topicSlug) params.set("topic", topicSlug);

  return `/admin/lessons/add?${params.toString()}`;
}
