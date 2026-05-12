import type { Lesson } from "@/lib/course";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type LessonRow = {
  id: string;
  slug: string;
  title_en: string;
  title_km: string;
  summary_en: string | null;
  summary_km: string | null;
  approximate_minutes: number | null;
  thumbnail_url: string | null;
  objectives_en: string[] | null;
  objectives_km: string[] | null;
  type: string | null;
  status: string;
};

type LessonVideoRow = {
  id: string;
  embed_url: string;
  title_en: string | null;
  title_km: string | null;
  sort_order: number;
};

/**
 * Fetch all published lessons from Supabase with their videos
 */
export async function getAllLessons(): Promise<Lesson[]> {
  const { data: lessonRows, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (lessonError) {
    console.error("Error fetching lessons:", lessonError);
    return [];
  }

  const lessons: Lesson[] = [];

  for (const row of lessonRows as LessonRow[]) {
    const { data: videos, error: videoError } = await supabase
      .from("lesson_videos")
      .select("*")
      .eq("lesson_id", row.id)
      .order("sort_order", { ascending: true });

    if (videoError) {
      console.error(`Error fetching videos for lesson ${row.slug}:`, videoError);
      continue;
    }

    lessons.push(transformLessonRow(row, videos as LessonVideoRow[]));
  }

  return lessons;
}

/**
 * Fetch a single lesson by slug with its videos
 */
export async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  const { data: lessonRow, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (lessonError || !lessonRow) {
    console.error("Error fetching lesson:", lessonError);
    return null;
  }

  const { data: videos, error: videoError } = await supabase
    .from("lesson_videos")
    .select("*")
    .eq("lesson_id", (lessonRow as LessonRow).id)
    .order("sort_order", { ascending: true });

  if (videoError) {
    console.error(
      `Error fetching videos for lesson ${slug}:`,
      videoError
    );
    return null;
  }

  return transformLessonRow(lessonRow as LessonRow, videos as LessonVideoRow[]);
}

/**
 * Transform database lesson row to frontend Lesson type
 */
function transformLessonRow(
  row: LessonRow,
  videos: LessonVideoRow[]
): Lesson {
  return {
    slug: row.slug,
    approximateMinutes: row.approximate_minutes || 0,
    thumbnailUrl: row.thumbnail_url || "",
    titles: {
      en: row.title_en,
      km: row.title_km,
    },
    summaries: {
      en: row.summary_en || "",
      km: row.summary_km || "",
    },
    objectives: {
      en: row.objectives_en || [],
      km: row.objectives_km || [],
    },
    type: (row.type as "free" | "paid") || undefined,
    videos: videos.map((v) => ({
      embedUrl: v.embed_url,
      titles: {
        en: v.title_en || "",
        km: v.title_km || "",
      },
    })),
  };
}
