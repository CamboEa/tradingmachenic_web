import type { Locale } from "./i18n";
import type { EducationCategory } from "./education-categories";
import { extractYouTubeVideoId, youtubeThumbnailUrl } from "./youtube";

export type LessonVideo = {
  /** Public embed URL, e.g. YouTube embed link */
  embedUrl: string;
  /** Optional heading shown above this embed */
  titles?: Record<Locale, string>;
};

export type Lesson = {
  slug: string;
  approximateMinutes: number;
  videos: LessonVideo[];
  /** Cover image for course listing cards (falls back to first video thumbnail when empty) */
  thumbnailUrl: string;
  titles: Record<Locale, string>;
  summaries: Record<Locale, string>;
  objectives: Record<Locale, string[]>;
  type?: "free" | "paid";
  mentorSlug?: string;
  category?: EducationCategory;
  lessonTopicSlug?: string;
  sortOrder?: number;
  youtubePlaylistId?: string;
  /** Set when loaded from admin (draft lessons are hidden on the public site). */
  status?: "draft" | "published";
};

export function youtubeThumbnailFromEmbed(embedUrl: string): string | null {
  const id = extractYouTubeVideoId(embedUrl);
  if (id) return youtubeThumbnailUrl(id);
  return null;
}

export function getLessonThumbnailSrc(lesson: Lesson): string {
  const first = lesson.videos[0]?.embedUrl;
  const fromEmbed = first ? youtubeThumbnailFromEmbed(first) : null;
  return lesson.thumbnailUrl || fromEmbed || "";
}

export function lessonVideoCount(lesson: Lesson): number {
  return lesson.videos.length;
}
