"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { LessonTopicForm } from "@/components/education/lesson-topic-form";
import type { LessonTopic } from "@/lib/supabase/lesson-topics";

type LessonTopicModalProps = {
  mentorSlug: string;
  mentorName: string;
  topic?: LessonTopic;
  onClose: () => void;
  onSaved: () => void;
};

export function LessonTopicModal({
  mentorSlug,
  mentorName,
  topic,
  onClose,
  onSaved,
}: LessonTopicModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close topic form"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-bridge/40 bg-background shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-bridge/40 bg-background/95 px-6 py-4 backdrop-blur">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-foreground">
              {topic ? "Edit lesson topic" : "Add lesson topic"}
            </h2>
            <p className="mt-0.5 text-sm text-ink-soft">
              {topic ? `Update ${topic.names.en}.` : `Create a topic for ${mentorName}.`}
            </p>
          </div>
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

        <div className="p-6">
          <LessonTopicForm
            topic={topic}
            mentorSlug={mentorSlug}
            mentorName={mentorName}
            onCancel={onClose}
            onSuccess={onSaved}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
