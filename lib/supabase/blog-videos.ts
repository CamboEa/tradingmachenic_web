import { resolveLessonVideoEmbedUrl } from "@/lib/media/video";

export type BlogVideoSource = "youtube" | "upload";

export type BlogVideoItem = {
  source: BlogVideoSource;
  url: string;
  title_en?: string;
  title_km?: string;
};

const MAX_BLOG_VIDEOS = 8;

export function parseBlogVideos(raw: unknown): BlogVideoItem[] {
  if (!Array.isArray(raw)) return [];

  const items: BlogVideoItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const url = typeof row.url === "string" ? row.url.trim() : "";
    if (!url) continue;

    const sourceRaw = row.source;
    const source: BlogVideoSource =
      sourceRaw === "upload" ? "upload" : "youtube";

    const title_en = typeof row.title_en === "string" ? row.title_en.trim() : "";
    const title_km = typeof row.title_km === "string" ? row.title_km.trim() : "";

    items.push({
      source,
      url,
      ...(title_en ? { title_en } : {}),
      ...(title_km ? { title_km } : {}),
    });
    if (items.length >= MAX_BLOG_VIDEOS) break;
  }
  return items;
}

export function normalizeBlogVideos(items: BlogVideoItem[]): BlogVideoItem[] {
  return parseBlogVideos(items);
}

/** Persist-safe list (normalized URLs for YouTube). */
export function serializeBlogVideosForDb(items: BlogVideoItem[]): BlogVideoItem[] {
  return normalizeBlogVideos(items).map((v) => ({
    ...v,
    url: v.source === "youtube" ? resolveLessonVideoEmbedUrl(v.url) : v.url.trim(),
  }));
}

export { MAX_BLOG_VIDEOS };
