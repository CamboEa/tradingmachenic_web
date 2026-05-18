import { createClient } from "./server";

export async function getCompletedLessonSlugs(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_slug")
    .eq("user_id", userId)
    .order("completed_at", { ascending: true });

  if (error) {
    console.error("lesson_progress fetch:", error.message);
    return [];
  }
  return (data ?? []).map((r) => r.lesson_slug);
}

export async function getContinueLessonSlug(
  userId: string,
  orderedSlugs: string[],
): Promise<string | null> {
  if (orderedSlugs.length === 0) return null;
  const completed = new Set(await getCompletedLessonSlugs(userId));
  const next = orderedSlugs.find((slug) => !completed.has(slug));
  return next ?? orderedSlugs[0] ?? null;
}
