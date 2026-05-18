"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { markLessonComplete } from "@/lib/supabase/actions";
import type { Locale } from "@/lib/i18n";

export function MarkLessonComplete({
  slug,
  locale,
  initialCompleted,
  completedLabel,
  markCompleteLabel,
  signInHint,
}: {
  slug: string;
  locale: Locale;
  initialCompleted: boolean;
  completedLabel: string;
  markCompleteLabel: string;
  signInHint: string;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, setPending] = useState(false);

  async function handleMark() {
    setPending(true);
    const result = await markLessonComplete(slug, locale);
    setPending(false);
    if (result.error) {
      toast.error(result.error === "Sign in to save progress" ? signInHint : result.error);
      return;
    }
    setCompleted(true);
    toast.success(completedLabel);
  }

  if (completed) {
    return (
      <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
        <span aria-hidden>✓</span>
        {completedLabel}
      </p>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleMark}
      className="mt-6 rounded-xl bg-[#0ea5e9] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 disabled:opacity-60"
    >
      {pending ? "…" : markCompleteLabel}
    </button>
  );
}
