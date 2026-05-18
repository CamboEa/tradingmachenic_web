/** Extract YouTube video id from a watch URL, youtu.be, embed, shorts, or live path, or a bare 11-char id. */
export function extractYouTubeVideoId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;

  let urlStr = raw;
  if (!/^https?:\/\//i.test(urlStr)) urlStr = `https://${urlStr}`;

  try {
    const u = new URL(urlStr);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (
      host === "youtube.com" ||
      host === "youtube-nocookie.com" ||
      host === "m.youtube.com"
    ) {
      const v = u.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

      const segs = u.pathname.split("/").filter(Boolean);
      for (const key of ["embed", "shorts", "live"]) {
        const i = segs.indexOf(key);
        if (i !== -1 && segs[i + 1] && /^[a-zA-Z0-9_-]{11}$/.test(segs[i + 1])) {
          return segs[i + 1];
        }
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function youtubeEmbedSrc(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0`;
}

/**
 * Turn any YouTube watch/share URL into an iframe-safe embed URL.
 * Non-YouTube URLs (e.g. R2 hosted video) are returned unchanged.
 */
export function resolveLessonVideoEmbedUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  const id = extractYouTubeVideoId(trimmed);
  if (id) return youtubeEmbedSrc(id);
  return trimmed;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}
