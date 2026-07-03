"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { useConfirm } from "@/components/shared/confirm-dialog";
import type { Lesson, LessonVideo } from "@/lib/education/course";
import { youtubeThumbnailFromEmbed } from "@/lib/education/course";
import { deleteLessonVideo } from "@/lib/supabase/actions";
import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

const PAGE_SIZE = 20;

type TopicVideoTableProps = {
  lesson: Lesson;
  /** Opens the add/edit modal (owned by the parent so the button can live in the page header). */
  onEditVideo: (video: LessonVideo) => void;
};

/** Paginated admin table for the videos inside a topic's lesson, with edit (modal) + delete. */
export function TopicVideoTable({ lesson, onEditVideo }: TopicVideoTableProps) {
  const router = useRouter();
  const { confirm, ConfirmDialogHost } = useConfirm();
  const videos = lesson.videos;

  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(videos.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageVideos = videos.slice(startIndex, startIndex + PAGE_SIZE);

  async function remove(video: LessonVideo) {
    if (!video.id) return;
    await confirm({
      title: "Remove this video?",
      description:
        video.titles?.en?.trim() || "This video will be removed from the topic.",
      confirmLabel: "Remove video",
      cancelLabel: "Keep",
      variant: "danger",
      onConfirm: async () => {
        const result = await deleteLessonVideo(video.id as string);
        if (result.error) {
          toast.error(result.error);
          throw new Error(result.error);
        }
        toast.success("Video removed");
        router.refresh();
      },
    });
  }

  return (
    <div className={cn(ui.card, "overflow-hidden")}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={ui.tableHeadRow}>
              <th className={cn(ui.tableTh, "w-12 text-center")}>#</th>
              <th className={cn(ui.tableTh, "w-36")}>Thumbnail</th>
              <th className={ui.tableTh}>Title</th>
              <th className={cn(ui.tableTh, "w-40 text-right")}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bridge/20">
            {videos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-ink-soft">
                  No videos yet. Use “+ Add video” to add the first one.
                </td>
              </tr>
            ) : null}

            {pageVideos.map((video, i) => {
              const number = startIndex + i + 1;
              const title = video.titles?.en?.trim() || `Video ${number}`;
              const thumb = youtubeThumbnailFromEmbed(video.embedUrl);

              return (
                <tr key={video.id ?? `${lesson.slug}-${number}`} className={ui.tableRow}>
                  <td className={cn(ui.tableTd, "text-center tabular-nums")}>{number}</td>
                  <td className={ui.tableTd}>
                    <div className="relative aspect-video w-28 overflow-hidden rounded-lg bg-slate-900">
                      {thumb ? (
                        <Image src={thumb} alt="" fill sizes="112px" className="object-cover" />
                      ) : null}
                    </div>
                  </td>
                  <td className={cn(ui.tableTd, "font-medium text-foreground")}>{title}</td>
                  <td className={cn(ui.tableTd, "text-right")}>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEditVideo(video)}
                        className="rounded-lg border border-bridge/40 px-3 py-1.5 text-xs font-semibold text-teal transition hover:bg-surface-soft"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(video)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pageCount > 1 ? (
        <div className="flex items-center justify-between gap-3 border-t border-bridge/30 px-4 py-3 text-sm">
          <span className="text-ink-soft">
            Page {currentPage} of {pageCount}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="rounded-lg border border-bridge/40 px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:bg-surface-soft disabled:pointer-events-none disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={n === currentPage ? "page" : undefined}
                className={cn(
                  "min-w-8 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                  n === currentPage
                    ? "bg-teal text-white"
                    : "border border-bridge/40 text-ink-muted hover:bg-surface-soft",
                )}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= pageCount}
              className="rounded-lg border border-bridge/40 px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:bg-surface-soft disabled:pointer-events-none disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      {ConfirmDialogHost}
    </div>
  );
}
