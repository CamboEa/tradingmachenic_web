import { extractYouTubeVideoId } from "@/lib/media/youtube";

export type LessonType = "free" | "paid";
export type FreeVideo = { embedUrl: string; titles: { en: string; km: string } };
export type PaidVideo = { url: string; titles: { en: string; km: string } };

export interface LessonFormInitialData {
  lesson: {
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
    type: LessonType | null;
    status: "draft" | "published" | null;
    mentor_slug: string | null;
    category: string | null;
    lesson_topic_slug: string | null;
  };
  videos: Array<{
    id: string;
    embed_url: string;
    title_en: string | null;
    title_km: string | null;
    sort_order: number;
  }>;
}

export const LESSON_FORM_STEPS = [
  { title: "Basics", hint: "Lesson type, titles, slug, and duration" },
  { title: "Summary", hint: "Short overview in English and Khmer" },
  { title: "Videos", hint: "YouTube links or uploaded video files" },
  { title: "Objectives", hint: "What learners will achieve" },
  { title: "Thumbnail & publish", hint: "Cover image and visibility" },
] as const;

export function parseObjectives(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim().replace(/^[•\-*]\s*/, ""))
    .filter(Boolean);
}

export function readFormString(form: HTMLFormElement, name: string): string {
  const raw = new FormData(form).get(name);
  return typeof raw === "string" ? raw.trim() : "";
}

export function initialVideoState(data?: LessonFormInitialData): {
  videos: FreeVideo[];
  paidVideos: PaidVideo[];
} {
  if (!data?.videos.length) return { videos: [], paidVideos: [] };

  const mapped = data.videos.map((video) => ({
    embedUrl: video.embed_url,
    url: video.embed_url,
    titles: { en: video.title_en || "", km: video.title_km || "" },
  }));

  if (data.lesson.type === "paid") {
    return {
      videos: [],
      paidVideos: mapped.map(({ url, titles }) => ({ url, titles })),
    };
  }

  return {
    videos: mapped.map(({ embedUrl, titles }) => ({ embedUrl, titles })),
    paidVideos: [],
  };
}

export function videoValidationError(
  lessonType: LessonType,
  videos: FreeVideo[],
  paidVideos: PaidVideo[],
): string | null {
  if (lessonType === "free") {
    if (videos.length === 0) return "Please add at least one YouTube video";
    if (videos.some((video) => !video.embedUrl.trim())) {
      return "Each free video needs a YouTube URL";
    }
    if (videos.some((video) => !extractYouTubeVideoId(video.embedUrl))) {
      return "Use a valid YouTube watch, share, or embed link for each free video";
    }
    return null;
  }

  if (paidVideos.length === 0) return "Please add at least one paid video";
  if (paidVideos.some((video) => !video.url.trim())) {
    return "Please upload all paid videos before continuing";
  }
  return null;
}
