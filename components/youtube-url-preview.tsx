"use client";

import { useMemo } from "react";

import { extractYouTubeVideoId, youtubeEmbedSrc } from "@/lib/youtube";

export function YoutubeUrlPreview({ url }: { url: string }) {
  const embedSrc = useMemo(() => {
    const id = extractYouTubeVideoId(url);
    return id ? youtubeEmbedSrc(id) : null;
  }, [url]);

  if (!embedSrc) return null;

  return (
    <div className="mt-2 w-full max-w-xl overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-sm">
      <div className="relative aspect-video w-full">
        <iframe
          title="YouTube preview"
          src={embedSrc}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
}
