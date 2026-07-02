"use client";

import { useState } from "react";
import { R2Uploader } from "@/components/shared/r2-uploader";
import { YoutubeUrlPreview } from "@/components/education/youtube-url-preview";
import { useConfirm } from "@/components/shared/confirm-dialog";
import {
  MAX_BLOG_VIDEOS,
  type BlogVideoItem,
  type BlogVideoSource,
} from "@/lib/supabase/blog-videos";
import { extractYouTubeVideoId } from "@/lib/media/youtube";

type VideoRow = BlogVideoItem & { key: string };

function newRow(partial?: Partial<BlogVideoItem>): VideoRow {
  return {
    key: crypto.randomUUID(),
    source: partial?.source ?? "youtube",
    url: partial?.url ?? "",
    title_en: partial?.title_en ?? "",
    title_km: partial?.title_km ?? "",
  };
}

function toItems(rows: VideoRow[]): BlogVideoItem[] {
  return rows
    .filter((r) => r.url.trim().length > 0)
    .map(({ source, url, title_en, title_km }) => ({
      source,
      url: url.trim(),
      ...(title_en?.trim() ? { title_en: title_en.trim() } : {}),
      ...(title_km?.trim() ? { title_km: title_km.trim() } : {}),
    }));
}

export function BlogVideoEditor({
  initialItems = [],
  onChange,
}: {
  initialItems?: BlogVideoItem[];
  onChange: (items: BlogVideoItem[]) => void;
}) {
  const [rows, setRows] = useState<VideoRow[]>(() =>
    initialItems.length > 0 ? initialItems.map((item) => newRow(item)) : [],
  );
  const { confirm, ConfirmDialogHost } = useConfirm();

  const sync = (next: VideoRow[]) => {
    setRows(next);
    onChange(toItems(next));
  };

  const updateRow = (key: string, patch: Partial<VideoRow>) => {
    sync(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const addRow = (source: BlogVideoSource) => {
    if (rows.length >= MAX_BLOG_VIDEOS) return;
    sync([...rows, newRow({ source })]);
  };

  async function removeRow(key: string) {
    const row = rows.find((r) => r.key === key);
    const label = row?.title_en?.trim() || "this video";
    await confirm({
      title: "Remove video?",
      description: `"${label}" will be removed from this article.`,
      confirmLabel: "Remove",
      cancelLabel: "Keep",
      variant: "danger",
      onConfirm: () => sync(rows.filter((r) => r.key !== key)),
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-soft">
        Optional. Add YouTube links or upload clips (MP4, WebM, etc.). Shown on the public article
        in the order listed.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => addRow("youtube")}
          disabled={rows.length >= MAX_BLOG_VIDEOS}
          className="rounded-lg border border-bridge/40 bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:border-gold/40 disabled:opacity-50"
        >
          + YouTube video
        </button>
        <button
          type="button"
          onClick={() => addRow("upload")}
          disabled={rows.length >= MAX_BLOG_VIDEOS}
          className="rounded-lg border border-bridge/40 bg-surface px-3 py-1.5 text-xs font-semibold text-foreground hover:border-gold/40 disabled:opacity-50"
        >
          + Upload video
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-bridge/40 bg-surface-soft px-4 py-6 text-center text-xs text-ink-soft">
          No videos yet. Articles can be text-only.
        </p>
      ) : null}

      {rows.map((row, index) => (
        <div key={row.key} className="rounded-xl border border-bridge/40 bg-surface-soft/80 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Video {index + 1} · {row.source === "youtube" ? "YouTube" : "Upload"}
            </span>
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              className="text-xs font-semibold text-red-400 hover:text-red-400"
            >
              Remove
            </button>
          </div>

          {row.source === "youtube" ? (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-ink-muted">
                  YouTube URL
                </label>
                <input
                  type="url"
                  value={row.url}
                  onChange={(e) => updateRow(row.key, { url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=…"
                  className="w-full rounded-lg border border-bridge/40 bg-surface px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-teal/20"
                />
                <YoutubeUrlPreview url={row.url} />
              </div>
            </div>
          ) : (
            <R2Uploader
              bucketName="trading-lesson"
              accept=".mp4,.mov,.webm,.avi,.mkv"
              label="Video file"
              hint=".mp4, .mov, .webm — max 500 MB"
              initialUrl={row.url || undefined}
              onUploaded={(url) => updateRow(row.key, { url })}
            />
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-muted">
                Caption (English)
              </label>
              <input
                type="text"
                value={row.title_en ?? ""}
                onChange={(e) => updateRow(row.key, { title_en: e.target.value })}
                placeholder="Optional label in playlist"
                className="w-full rounded-lg border border-bridge/40 bg-surface px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-teal/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-muted">
                Caption (Khmer)
              </label>
              <input
                type="text"
                value={row.title_km ?? ""}
                onChange={(e) => updateRow(row.key, { title_km: e.target.value })}
                className="w-full rounded-lg border border-bridge/40 bg-surface px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-teal/20"
              />
            </div>
          </div>
        </div>
      ))}
      {ConfirmDialogHost}
    </div>
  );
}

/** Validate videos before save; optional empty list is OK. */
export function validateBlogVideos(items: BlogVideoItem[]): string | null {
  for (let i = 0; i < items.length; i++) {
    const v = items[i];
    if (!v.url.trim()) return `Video ${i + 1} needs a URL or upload`;
    if (v.source === "youtube" && !extractYouTubeVideoId(v.url)) {
      return `Video ${i + 1}: enter a valid YouTube link`;
    }
  }
  return null;
}
