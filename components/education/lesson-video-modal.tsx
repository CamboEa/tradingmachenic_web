"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";

import { Button } from "@/components/ui";
import type { LessonVideo } from "@/lib/education/course";
import { addLessonVideo, updateLessonVideo } from "@/lib/supabase/actions";
import { FIELD_CLASS } from "@/lib/ui/styles";

type LessonVideoModalProps = {
  lessonSlug: string;
  /** Present = edit that video; absent = add a new one. */
  video?: LessonVideo;
  onClose: () => void;
  onSaved: () => void;
};

export function LessonVideoModal({
  lessonSlug,
  video,
  onClose,
  onSaved,
}: LessonVideoModalProps) {
  const isEdit = !!video;
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [titleEn, setTitleEn] = useState(video?.titles?.en ?? "");
  const [titleKm, setTitleKm] = useState(video?.titles?.km ?? "");
  const [embedUrl, setEmbedUrl] = useState(video?.embedUrl ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!embedUrl.trim()) {
      toast.error("Enter a YouTube link");
      return;
    }

    setSaving(true);
    const payload = { embedUrl, title_en: titleEn, title_km: titleKm };
    const result = isEdit
      ? await updateLessonVideo(video.id as string, payload)
      : await addLessonVideo(lessonSlug, payload);
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEdit ? "Video updated" : "Video added");
    onSaved();
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close video form"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-bridge/40 bg-background shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-bridge/40 bg-background/95 px-6 py-4 backdrop-blur">
          <h2 id={titleId} className="text-lg font-bold text-foreground">
            {isEdit ? "Edit video" : "Add video"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-soft hover:text-foreground"
            aria-label="Close"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden>
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
              Title (English)
            </label>
            <input
              className={FIELD_CLASS}
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="Video title"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
              Title (Khmer)
            </label>
            <input
              className={FIELD_CLASS}
              value={titleKm}
              onChange={(e) => setTitleKm(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
              YouTube link
            </label>
            <input
              className={FIELD_CLASS}
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=… or 11-character video ID"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Save video" : "Add video"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
