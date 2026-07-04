import { unstable_cache } from "next/cache";

import type { Lesson } from "@/lib/education/course";
import type { EducationCategory } from "@/lib/education/categories";
import { LESSONS_CACHE_TAG } from "@/lib/cache-tags";
import { sortLessonsByDisplayOrder } from "@/lib/education/lessons-sort";
import { resolveLessonVideoEmbedUrl } from "@/lib/media/youtube";
import { getSharedAdminClient, getSharedPublicClient } from "./shared";

const supabase = getSharedPublicClient();

function adminSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return getSharedAdminClient();
}

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
  mentor_slug: string | null;
  category: string | null;
  lesson_topic_slug: string | null;
  sort_order: number | null;
  youtube_playlist_id: string | null;
};

type LessonVideoRow = {
  id: string;
  embed_url: string;
  title_en: string | null;
  title_km: string | null;
  sort_order: number;
};

type LessonRowWithVideos = LessonRow & {
  lesson_videos: LessonVideoRow[] | null;
};

const LESSON_WITH_VIDEOS_SELECT =
  "*, lesson_videos(id, embed_url, title_en, title_km, sort_order)";

/** Next 16 cache entries must be plain serializable data. */
function toCacheable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sortVideos(videos: LessonVideoRow[] | null | undefined): LessonVideoRow[] {
  return [...(videos ?? [])].sort((a, b) => a.sort_order - b.sort_order);
}

function transformLessonRow(
  row: LessonRow,
  videos: LessonVideoRow[],
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
    mentorSlug: row.mentor_slug || undefined,
    category: (row.category as EducationCategory) || undefined,
    lessonTopicSlug: row.lesson_topic_slug || undefined,
    sortOrder: row.sort_order ?? 0,
    youtubePlaylistId: row.youtube_playlist_id || undefined,
    status: row.status === "published" ? "published" : "draft",
    videos: videos.map((v) => ({
      id: v.id,
      embedUrl: resolveLessonVideoEmbedUrl(v.embed_url),
      titles: {
        en: v.title_en || "",
        km: v.title_km || "",
      },
    })),
  };
}

function rowsToLessons(rows: LessonRowWithVideos[]): Lesson[] {
  return rows.map((row) => {
    const { lesson_videos, ...lessonRow } = row;
    return transformLessonRow(lessonRow, sortVideos(lesson_videos));
  });
}

async function fetchPublishedLessons(): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select(LESSON_WITH_VIDEOS_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching lessons:", error);
    return [];
  }

  return rowsToLessons((data ?? []) as unknown as LessonRowWithVideos[]);
}

async function fetchAdminLessons(mentorSlug?: string): Promise<Lesson[]> {
  const client = adminSupabase();
  if (!client) {
    console.error("Missing Supabase admin credentials for lessons");
    return [];
  }

  let query = client
    .from("lessons")
    .select(LESSON_WITH_VIDEOS_SELECT)
    .order("created_at", { ascending: true });

  if (mentorSlug?.trim()) {
    query = query.eq("mentor_slug", mentorSlug.trim());
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching admin lessons:", error);
    return [];
  }

  return rowsToLessons((data ?? []) as unknown as LessonRowWithVideos[]);
}

const getCachedPublishedLessons = unstable_cache(
  async () => toCacheable(await fetchPublishedLessons()),
  ["published-lessons"],
  {
    revalidate: 60,
    tags: [LESSONS_CACHE_TAG],
  },
);

/** Published lessons + videos (cached, single joined query). */
export async function getAllLessons(): Promise<Lesson[]> {
  return getCachedPublishedLessons();
}

/** All lessons for admin (joined query, not cached). */
export async function getAllLessonsForAdmin(mentorSlug?: string): Promise<Lesson[]> {
  return fetchAdminLessons(mentorSlug);
}

/** Single published lesson — uses the shared lessons cache. */
export async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  const lessons = await getAllLessons();
  return lessons.find((lesson) => lesson.slug === slug) ?? null;
}

export async function getLessonsByMentorAndCategory(
  mentorSlug: string,
  category: EducationCategory,
): Promise<Lesson[]> {
  const lessons = await getAllLessons();
  return sortLessonsByDisplayOrder(
    lessons.filter(
      (lesson) =>
        lesson.mentorSlug === mentorSlug && lesson.category === category,
    ),
  );
}
