"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { YoutubeUrlPreview } from "@/components/education/youtube-url-preview";
import { categoryLabels } from "@/components/education/mentor-detail/mentor-detail-config";
import { R2Uploader } from "@/components/shared/r2-uploader";
import { Button } from "@/components/ui";
import type { EducationCategory } from "@/lib/education/categories";
import { extractYouTubeVideoId } from "@/lib/media/youtube";
import { slugify } from "@/lib/slug";
import { createLesson } from "@/lib/supabase/actions";
import type { LessonTopic } from "@/lib/supabase/lesson-topics";
import { FIELD_CLASS } from "@/lib/ui/styles";

type LessonAddFormProps = {
  mentorSlug: string;
  categories: EducationCategory[];
  topics: LessonTopic[];
  defaultTopicSlug?: string;
  defaultCategory?: EducationCategory;
  onCancel: () => void;
  onSuccess: () => void;
};

export function LessonAddForm({
  mentorSlug,
  categories,
  topics,
  defaultTopicSlug = "",
  defaultCategory,
  onCancel,
  onSuccess,
}: LessonAddFormProps) {
  const [titleEn, setTitleEn] = useState("");
  const [lessonType, setLessonType] = useState<"free" | "paid">("free");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [category, setCategory] = useState(
    defaultCategory ?? categories[0] ?? "",
  );
  const [topicSlug, setTopicSlug] = useState(defaultTopicSlug);
  const [minutes, setMinutes] = useState(10);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = titleEn.trim();
    if (!title) {
      toast.error("Enter a lesson title");
      return;
    }

    const slug = slugify(title);
    if (!slug) {
      toast.error("Title must produce a valid URL slug");
      return;
    }

    if (!Number.isFinite(minutes) || minutes < 1) {
      toast.error("Duration must be at least 1 minute");
      return;
    }

    if (lessonType === "free") {
      if (!youtubeUrl.trim()) {
        toast.error("Paste a YouTube link for this lesson");
        return;
      }
      if (!extractYouTubeVideoId(youtubeUrl)) {
        toast.error("Use a valid YouTube watch, share, or embed link");
        return;
      }
    } else if (!uploadedUrl.trim()) {
      toast.error("Upload a video file for this lesson");
      return;
    }

    setSaving(true);
    const result = await createLesson({
      slug,
      title_en: title,
      title_km: title,
      summary_en: title,
      summary_km: title,
      approximate_minutes: minutes,
      objectives_en: [],
      objectives_km: [],
      type: lessonType,
      status: "published",
      mentor_slug: mentorSlug,
      category: category || null,
      lesson_topic_slug: topicSlug || null,
      videos:
        lessonType === "free"
          ? [{ embedUrl: youtubeUrl.trim(), title_en: title, title_km: title }]
          : [{ url: uploadedUrl.trim(), title_en: title, title_km: title }],
    });
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Lesson added");
    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-ink-soft">
        Add the lesson title and video together — one lesson is one video.
      </p>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Lesson title <span className="text-red-500">*</span>
        </label>
        <input
          className={FIELD_CLASS}
          value={titleEn}
          onChange={(event) => setTitleEn(event.target.value)}
          placeholder="e.g. CSNR entry model"
          autoFocus
        />
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-semibold text-ink-muted">Lesson type</span>
        <div className="flex flex-wrap gap-2">
          {(["free", "paid"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setLessonType(type)}
              className={
                lessonType === type
                  ? "rounded-lg border border-teal bg-teal/10 px-3 py-2 text-sm font-semibold text-teal"
                  : "rounded-lg border border-bridge/40 px-3 py-2 text-sm font-semibold text-ink-muted transition hover:border-bridge/60 hover:text-foreground"
              }
            >
              {type === "free" ? "Free (YouTube)" : "Paid (upload)"}
            </button>
          ))}
        </div>
      </div>

      {lessonType === "free" ? (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
            YouTube link <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            className={FIELD_CLASS}
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=…"
          />
          <YoutubeUrlPreview url={youtubeUrl} />
        </div>
      ) : (
        <div className="rounded-lg border border-bridge/40 bg-surface-soft p-4">
          <R2Uploader
            bucketName="trading-lesson"
            accept=".mp4,.mov,.webm,.avi,.mkv"
            label="Lesson video"
            hint=".mp4, .mov, .webm, .avi, .mkv — max 500 MB"
            initialUrl={uploadedUrl || undefined}
            onUploaded={(url) => setUploadedUrl(url)}
          />
        </div>
      )}

      {categories.length > 1 ? (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Category</label>
          <select
            className={FIELD_CLASS}
            value={category}
            onChange={(event) => setCategory(event.target.value as EducationCategory)}
          >
            {categories.map((value) => (
              <option key={value} value={value}>
                {categoryLabels[value]}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {topics.length > 0 && !defaultTopicSlug ? (
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Topic</label>
          <select
            className={FIELD_CLASS}
            value={topicSlug}
            onChange={(event) => setTopicSlug(event.target.value)}
          >
            <option value="">No topic</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.slug}>
                {topic.names.en}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
          Approximate duration (minutes)
        </label>
        <input
          type="number"
          min={1}
          className={FIELD_CLASS}
          value={minutes}
          onChange={(event) => setMinutes(parseInt(event.target.value, 10) || 0)}
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Add lesson"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
