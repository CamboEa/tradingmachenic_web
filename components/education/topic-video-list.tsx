import Image from "next/image";

import type { Lesson } from "@/lib/education/course";
import { youtubeThumbnailFromEmbed } from "@/lib/education/course";
import { extractYouTubeVideoId, youtubeWatchUrl } from "@/lib/media/youtube";
import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

function watchHref(embedUrl: string): string | null {
  const id = extractYouTubeVideoId(embedUrl);
  return id ? youtubeWatchUrl(id) : null;
}

/** Read view of every video inside a topic's lesson (shown when a topic is opened). */
export function TopicVideoList({ lesson }: { lesson: Lesson }) {
  if (lesson.videos.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-bridge/50 bg-surface-soft/40 px-4 py-12 text-center text-sm text-ink-soft">
        No videos in this topic yet. Use “Manage videos” to add the first one.
      </p>
    );
  }

  return (
    <ul className={cn(ui.card, "divide-y divide-bridge/30 overflow-hidden")}>
      {lesson.videos.map((video, index) => {
        const title = video.titles?.en?.trim() || `Video ${index + 1}`;
        const thumb = youtubeThumbnailFromEmbed(video.embedUrl);
        const href = watchHref(video.embedUrl);

        const inner = (
          <div className="flex items-center gap-4 px-4 py-3">
            <span className="w-6 shrink-0 text-center text-xs font-bold tabular-nums text-ink-soft">
              {index + 1}
            </span>
            <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-slate-900">
              {thumb ? (
                <Image src={thumb} alt="" fill sizes="112px" className="object-cover" />
              ) : null}
            </div>
            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
              {title}
            </p>
            {href ? (
              <span className="shrink-0 text-xs font-medium text-teal">Watch ↗</span>
            ) : null}
          </div>
        );

        return (
          <li key={`${lesson.slug}-${index}`}>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition hover:bg-surface-soft/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal/40"
              >
                {inner}
              </a>
            ) : (
              inner
            )}
          </li>
        );
      })}
    </ul>
  );
}
