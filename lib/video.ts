import { extractYouTubeVideoId, resolveLessonVideoEmbedUrl } from "@/lib/youtube";

export { resolveLessonVideoEmbedUrl };

export function isYouTubeVideoUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/** Hosted file (R2, CDN, etc.) — use HTML5 <video>, not iframe. */
export function isDirectVideoFileUrl(url: string): boolean {
  if (!url.trim() || isYouTubeVideoUrl(url)) return false;
  try {
    const u = new URL(url.trim());
    if (/\.(mp4|webm|mov|m4v|ogg|ogv)(\?|#|$)/i.test(u.pathname)) return true;
    if (u.hostname.includes("r2.dev") || u.hostname.includes("cloudflarestorage.com")) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}
