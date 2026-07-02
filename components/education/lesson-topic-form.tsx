"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

import { R2Uploader } from "@/components/shared/r2-uploader";
import { slugify } from "@/lib/slug";
import { createLessonTopic, updateLessonTopic } from "@/lib/supabase/actions";
import type { LessonTopic } from "@/lib/supabase/lesson-topics";
import { adminLessonTopicsHref } from "@/lib/admin-lessons-nav";
import { ui, FIELD_CLASS } from "@/lib/ui/styles";

const fieldClass = FIELD_CLASS;

export function LessonTopicForm({
  topic,
  mentorSlug,
  mentorName,
  onSuccess,
  onCancel,
}: {
  topic?: LessonTopic;
  mentorSlug: string;
  mentorName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const isEdit = !!topic;
  const [isSaving, setIsSaving] = useState(false);
  const [slug, setSlug] = useState(topic?.slug ?? "");
  const [imageUrl, setImageUrl] = useState(topic?.imageUrl ?? "");

  const backHref = adminLessonTopicsHref(mentorSlug);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name_en = (formData.get("name_en") as string)?.trim() ?? "";
    const name_km = (formData.get("name_km") as string)?.trim() ?? "";
    const description_en = (formData.get("description_en") as string)?.trim() ?? "";
    const description_km = (formData.get("description_km") as string)?.trim() ?? "";
    const resolvedSlug = slugify(slug || name_en);

    if (!name_en) {
      toast.error("English name is required");
      return;
    }
    if (!resolvedSlug) {
      toast.error("Enter a valid slug or English name");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        slug: resolvedSlug,
        name_en,
        name_km,
        description_en: description_en || undefined,
        description_km: description_km || undefined,
        image_url: imageUrl.trim() || undefined,
      };

      const result = isEdit
        ? await updateLessonTopic(topic.id, payload)
        : await createLessonTopic({ mentor_slug: mentorSlug, ...payload });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(isEdit ? "Topic updated" : "Topic created");
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = backHref;
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
      <div className="rounded-xl border border-bridge/30 bg-surface-soft/40 px-4 py-3 text-sm text-ink-soft">
        Mentor: <span className="font-semibold text-foreground">{mentorName}</span>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Name (English) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name_en"
          defaultValue={topic?.names.en ?? ""}
          placeholder="e.g. ICT"
          className={fieldClass}
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Name (Khmer)
        </label>
        <input
          type="text"
          name="name_km"
          defaultValue={topic?.names.km ?? ""}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="e.g. ict"
          className={`${fieldClass} font-mono`}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Description (English)
        </label>
        <textarea
          name="description_en"
          rows={3}
          defaultValue={topic?.descriptions.en ?? ""}
          placeholder="Short description shown in the admin topic picker"
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Description (Khmer)
        </label>
        <textarea
          name="description_km"
          rows={3}
          defaultValue={topic?.descriptions.km ?? ""}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Cover image URL
        </label>
        <input
          type="text"
          name="image_url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://... or upload below"
          className={fieldClass}
        />
        <div className="mt-3">
          <R2Uploader
            bucketName="trading-tool"
            accept="image/png,image/jpeg,image/webp"
            label="Or upload a cover image"
            hint="PNG, JPG, or WebP. Saved to cloud storage."
            initialUrl={topic?.imageUrl || undefined}
            onUploaded={(url) => setImageUrl(url)}
            getKeyPrefix={() => "lesson-topics/"}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="submit" disabled={isSaving} className={ui.btnPrimary}>
          {isSaving ? "Saving…" : isEdit ? "Save topic" : "Create topic"}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} className={ui.btnSecondary}>
            Cancel
          </button>
        ) : (
          <Link href={backHref} className={ui.btnSecondary}>
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
