"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { createLesson, updateLesson } from "@/lib/supabase/actions";
import { useConfirm } from "@/components/confirm-dialog";
import { LocaleParityHint } from "@/components/locale-parity-hint";
import { R2Uploader } from "@/components/r2-uploader";
import { YoutubeUrlPreview } from "@/components/youtube-url-preview";
import { slugify } from "@/lib/slug";
import { extractYouTubeVideoId, resolveLessonVideoEmbedUrl } from "@/lib/youtube";

type LessonType = "free" | "paid";

function parseObjectives(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim().replace(/^[•\-*]\s*/, ""))
    .filter(Boolean);
}

interface InitialData {
  lesson: {
    id: string;
    slug: string;
    title_en: string;
    title_km: string;
    summary_en: string | null;
    summary_km: string | null;
    approximate_minutes: number | null;
    thumbnail_url: string | null;
    objectives_en: string[] | null;
    objectives_km: string[] | null;
    type: "free" | "paid" | null;
    status: "draft" | "published" | null;
  };
  videos: Array<{
    id: string;
    embed_url: string;
    title_en: string | null;
    title_km: string | null;
    sort_order: number;
  }>;
}

interface LessonFormProps {
  initialData?: InitialData;
  isEditing?: boolean;
}

type FreeVideo = { embedUrl: string; titles: { en: string; km: string } };
type PaidVideo = { url: string; titles: { en: string; km: string } };

function initialVideoState(data?: InitialData): {
  videos: FreeVideo[];
  paidVideos: PaidVideo[];
} {
  if (!data?.videos.length) {
    return { videos: [], paidVideos: [] };
  }

  const mapped = data.videos.map((v) => ({
    embedUrl: v.embed_url,
    url: v.embed_url,
    titles: { en: v.title_en || "", km: v.title_km || "" },
  }));

  if (data.lesson.type === "paid") {
    return {
      videos: [],
      paidVideos: mapped.map(({ url, titles }) => ({ url, titles })),
    };
  }

  return {
    videos: mapped.map(({ embedUrl, titles }) => ({ embedUrl, titles })),
    paidVideos: [],
  };
}

export function LessonForm({ initialData, isEditing = false }: LessonFormProps) {
  const initialVideos = initialVideoState(initialData);

  const [lessonType, setLessonType] = useState<LessonType>(
    initialData?.lesson.type || "free"
  );
  const [videos, setVideos] = useState<FreeVideo[]>(initialVideos.videos);
  const [paidVideos, setPaidVideos] = useState<PaidVideo[]>(initialVideos.paidVideos);
  const [thumbnailMode, setThumbnailMode] = useState<"url" | "upload">("url");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialData?.lesson.thumbnail_url || "",
  );
  const [titleEn, setTitleEn] = useState(initialData?.lesson.title_en ?? "");
  const [titleKm, setTitleKm] = useState(initialData?.lesson.title_km ?? "");
  const [slug, setSlug] = useState(initialData?.lesson.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initialData?.lesson.slug);
  const [summaryEn, setSummaryEn] = useState(initialData?.lesson.summary_en ?? "");
  const [summaryKm, setSummaryKm] = useState(initialData?.lesson.summary_km ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const { confirm, ConfirmDialogHost } = useConfirm();

  const originalSlug = initialData?.lesson.slug ?? "";

  function handleTitleEnChange(value: string) {
    setTitleEn(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function syncSlugFromTitle() {
    const next = slugify(titleEn);
    if (next) {
      setSlug(next);
      setSlugTouched(false);
    }
  }

  const defaultStatus = isEditing
    ? initialData?.lesson.status === "published"
      ? "Published"
      : "Draft"
    : "Published";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (lessonType === "free") {
      if (videos.length === 0) {
        toast.error("Please add at least one YouTube video");
        return;
      }
      if (videos.some((v) => !v.embedUrl.trim())) {
        toast.error("Each free video needs a YouTube URL");
        return;
      }
      if (videos.some((v) => !extractYouTubeVideoId(v.embedUrl))) {
        toast.error("Use a valid YouTube watch, share, or embed link for each free video");
        return;
      }
    } else {
      if (paidVideos.length === 0) {
        toast.error("Please add at least one paid video");
        return;
      }
      if (paidVideos.some((v) => !v.url.trim())) {
        toast.error("Please upload all paid videos before submitting");
        return;
      }
    }

    setIsSaving(true);
    const form = e.currentTarget;
    
    try {
      const normalizedSlug = slugify(slug);
      const title_en = titleEn.trim();
      const title_km = titleKm.trim();
      const summary_en = (form.querySelector('textarea[name="summary_en"]') as HTMLTextAreaElement)?.value;
      const summary_km = (form.querySelector('textarea[name="summary_km"]') as HTMLTextAreaElement)?.value;
      const approximate_minutes = parseInt((form.querySelector('input[name="approximate_minutes"]') as HTMLInputElement)?.value || "0");
      const objectives_en = parseObjectives(
        (form.querySelector('textarea[name="objectives_en"]') as HTMLTextAreaElement)?.value || "",
      );
      const objectives_km = parseObjectives(
        (form.querySelector('textarea[name="objectives_km"]') as HTMLTextAreaElement)?.value || "",
      );
      const statusRaw = (form.querySelector('input[name="status"]:checked') as HTMLInputElement)?.value;
      const status = statusRaw === "Published" ? "published" : "draft";

      if (!normalizedSlug || !title_en || !title_km || !summary_en || !summary_km) {
        toast.error("Please fill in all required fields (English title generates the slug)");
        setIsSaving(false);
        return;
      }

      const videosToSave = lessonType === "free"
        ? videos.map((v) => ({
            embedUrl: resolveLessonVideoEmbedUrl(v.embedUrl),
            title_en: v.titles.en,
            title_km: v.titles.km,
          }))
        : paidVideos.map((v) => ({ url: v.url, title_en: v.titles.en, title_km: v.titles.km }));

      const thumbnail_url = thumbnailUrl.trim() || null;

      if (isEditing && initialData) {
        const result = await updateLesson(originalSlug, {
          slug: normalizedSlug,
          title_en,
          title_km,
          summary_en,
          summary_km,
          approximate_minutes,
          objectives_en,
          objectives_km,
          type: lessonType,
          status,
          thumbnail_url,
          videos: videosToSave,
        });

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Lesson updated successfully!");
          const nextSlug = result.slug ?? normalizedSlug;
          setTimeout(() => {
            if (nextSlug !== originalSlug) {
              window.location.href = `/admin/lessons/edit/${encodeURIComponent(nextSlug)}`;
            } else {
              window.location.reload();
            }
          }, 800);
        }
      } else {
        const result = await createLesson({
          slug: normalizedSlug,
          title_en,
          title_km,
          summary_en,
          summary_km,
          approximate_minutes,
          objectives_en,
          objectives_km,
          type: lessonType,
          status,
          thumbnail_url,
          videos: videosToSave,
        });

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(
            status === "published"
              ? "Lesson published — visible on Education."
              : "Saved as draft — set status to Published to show on Education.",
          );
          setTimeout(() => window.location.href = "/admin/lessons", 1500);
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save lesson");
    } finally {
      setIsSaving(false);
    }
  };

  const addVideo = () => {
    setVideos([...videos, { embedUrl: "", titles: { en: "", km: "" } }]);
  };

  async function requestRemoveVideo(index: number) {
    const label = videos[index]?.titles.en?.trim() || `Video ${index + 1}`;
    await confirm({
      title: "Remove this video?",
      description: `"${label}" will be removed from this lesson. Save the lesson to apply the change.`,
      confirmLabel: "Remove video",
      cancelLabel: "Keep video",
      variant: "danger",
      onConfirm: () => {
        setVideos(videos.filter((_, i) => i !== index));
      },
    });
  }

  const updateVideo = (
    index: number,
    field: string,
    value: string,
    locale?: string
  ) => {
    const newVideos = [...videos];
    if (field === "embedUrl") {
      newVideos[index].embedUrl = value;
    } else if (field === "titles" && locale) {
      newVideos[index].titles[locale as "en" | "km"] = value;
    }
    setVideos(newVideos);
  };

  const addPaidVideo = (url: string) => {
    setPaidVideos([...paidVideos, { url, titles: { en: "", km: "" } }]);
  };

  async function requestRemovePaidVideo(index: number) {
    const label = paidVideos[index]?.titles.en?.trim() || `Video ${index + 1}`;
    const hasUpload = Boolean(paidVideos[index]?.url?.trim());
    await confirm({
      title: "Remove this video?",
      description: hasUpload
        ? `"${label}" and its uploaded file reference will be removed from this lesson. Save to apply.`
        : `"${label}" will be removed from this lesson.`,
      confirmLabel: "Remove video",
      cancelLabel: "Keep video",
      variant: "danger",
      onConfirm: () => {
        setPaidVideos(paidVideos.filter((_, i) => i !== index));
      },
    });
  }

  const updatePaidVideo = (
    index: number,
    field: string,
    value: string,
    locale?: string
  ) => {
    const newVideos = [...paidVideos];
    if (field === "titles" && locale) {
      newVideos[index].titles[locale as "en" | "km"] = value;
    }
    setPaidVideos(newVideos);
  };

  return (
    <>
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-base font-bold text-[#1e293b]">
        Lesson Details
      </h2>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Lesson Type */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Lesson Type <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {(["free", "paid"] as const).map((type) => (
              <label
                key={type}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-colors has-[:checked]:border-[#0ea5e9] has-[:checked]:bg-sky-50"
              >
                <input
                  type="radio"
                  name="lessonType"
                  value={type}
                  checked={lessonType === type}
                  onChange={(e) => setLessonType(e.target.value as LessonType)}
                  className="accent-[#0ea5e9]"
                />
                {type === "free" ? "Free (YouTube)" : "Paid (Cloudflare)"}
              </label>
            ))}
          </div>
        </div>

        {/* Title EN — fill first; slug auto-generates below */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Title (English) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title_en"
            placeholder="e.g. Price Action Basics"
            value={titleEn}
            onChange={(e) => handleTitleEnChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
          />
          <LocaleParityHint
            enFilled={titleEn.trim().length > 0}
            kmFilled={titleKm.trim().length > 0}
          />
        </div>

        {/* Slug */}
        <div>
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-600">
              Slug <span className="text-red-500">*</span>
            </label>
            {slugTouched && titleEn.trim() ? (
              <button
                type="button"
                onClick={syncSlugFromTitle}
                className="text-xs font-semibold text-[#0ea5e9] transition hover:text-sky-700"
              >
                Regenerate from title
              </button>
            ) : null}
          </div>
          <input
            type="text"
            name="slug"
            placeholder="Generated when you enter the English title"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 font-mono text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
          />
          <p className="mt-1 text-xs text-slate-400">
            URL path for this lesson (e.g. /education/your-slug). Auto-filled from the English title; edit anytime.
          </p>
        </div>

        {/* Title KM */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Title (Khmer) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title_km"
            placeholder="ឧ. មូលដ្ឋានគោលលេខ"
            value={titleKm}
            onChange={(e) => setTitleKm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
          />
        </div>

        {/* Summary EN */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Summary (English) <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            name="summary_en"
            placeholder="Brief overview of this lesson..."
            value={summaryEn}
            onChange={(e) => setSummaryEn(e.target.value)}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
          />
          <LocaleParityHint
            enFilled={summaryEn.trim().length > 0}
            kmFilled={summaryKm.trim().length > 0}
            label="Khmer summary missing"
          />
        </div>

        {/* Summary KM */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Summary (Khmer) <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            name="summary_km"
            placeholder="ពិពណ៌នាសង្ខេប..."
            value={summaryKm}
            onChange={(e) => setSummaryKm(e.target.value)}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
          />
        </div>

        {/* Approximate Minutes */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Approximate Duration (minutes) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="approximate_minutes"
            min="1"
            placeholder="45"
            defaultValue={initialData?.lesson.approximate_minutes || ""}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
          />
        </div>

        {/* Videos Section */}
        <div className="space-y-4 border-t border-slate-200 pt-5">
          {lessonType === "free" ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#1e293b]">YouTube Videos</h3>
                <button
                  type="button"
                  onClick={addVideo}
                  className="text-xs font-semibold text-[#0ea5e9] transition hover:text-sky-700"
                >
                  + Add Video
                </button>
              </div>

              {videos.map((video, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                      Video {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => requestRemoveVideo(idx)}
                      className="text-xs font-semibold text-red-500 transition hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        YouTube URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=… or youtu.be/…"
                        value={video.embedUrl}
                        onChange={(e) =>
                          updateVideo(idx, "embedUrl", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
                      />
                      <YoutubeUrlPreview url={video.embedUrl} />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Video Title (English)
                      </label>
                      <input
                        type="text"
                        placeholder="Optional heading for this video"
                        value={video.titles.en}
                        onChange={(e) =>
                          updateVideo(idx, "titles", e.target.value, "en")
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Video Title (Khmer)
                      </label>
                      <input
                        type="text"
                        placeholder="ចំណងជើងវីដេអូ (ច្រើនឯក)"
                        value={video.titles.km}
                        onChange={(e) =>
                          updateVideo(idx, "titles", e.target.value, "km")
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {videos.length === 0 && (
                <p className="text-sm text-slate-400">
                  No videos added yet. Click "Add Video" to get started.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#1e293b]">Upload Videos</h3>
                <button
                  type="button"
                  onClick={() => addPaidVideo("")}
                  className="text-xs font-semibold text-[#0ea5e9] transition hover:text-sky-700"
                >
                  + Add Video
                </button>
              </div>

              {paidVideos.map((video, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-600">
                      Video {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => requestRemovePaidVideo(idx)}
                      className="text-xs font-semibold text-red-500 transition hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-3">
                    {video.url === "" ? (
                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <R2Uploader
                          bucketName="trading-lesson"
                          accept=".mp4,.mov,.webm,.avi,.mkv"
                          label="Video File"
                          hint=".mp4, .mov, .webm, .avi, .mkv — max 500 MB"
                          onUploaded={(url) => {
                            const newVideos = [...paidVideos];
                            newVideos[idx].url = url;
                            setPaidVideos(newVideos);
                          }}
                        />
                      </div>
                    ) : (
                      <R2Uploader
                        bucketName="trading-lesson"
                        accept=".mp4,.mov,.webm,.avi,.mkv"
                        label="Video File"
                        hint=".mp4, .mov, .webm, .avi, .mkv — max 500 MB"
                        initialUrl={video.url}
                        onUploaded={(url) => {
                          const newVideos = [...paidVideos];
                          newVideos[idx].url = url;
                          setPaidVideos(newVideos);
                        }}
                      />
                    )}

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Video Title (English)
                      </label>
                      <input
                        type="text"
                        placeholder="Optional heading for this video"
                        value={video.titles.en}
                        onChange={(e) =>
                          updatePaidVideo(idx, "titles", e.target.value, "en")
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Video Title (Khmer)
                      </label>
                      <input
                        type="text"
                        placeholder="ចំណងជើងវីដេអូ (ច្រើនឯក)"
                        value={video.titles.km}
                        onChange={(e) =>
                          updatePaidVideo(idx, "titles", e.target.value, "km")
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {paidVideos.length === 0 && (
                <p className="text-sm text-slate-400">
                  No videos added yet. Click "Add Video" to get started.
                </p>
              )}
            </>
          )}
        </div>

        {/* Objectives Section */}
        <div className="space-y-4 border-t border-slate-200 pt-5">
          <h3 className="font-semibold text-[#1e293b]">Learning Objectives</h3>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Objectives (English) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="objectives_en"
              rows={3}
              placeholder="• Objective 1&#10;• Objective 2&#10;• Objective 3"
              defaultValue={(initialData?.lesson.objectives_en || []).join("\n")}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
            />
            <p className="mt-1 text-xs text-slate-400">
              One objective per line
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Objectives (Khmer) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="objectives_km"
              rows={3}
              placeholder="• គោលបំណង ១&#10;• គោលបំណង ២&#10;• គោលបំណង ៣"
              defaultValue={(initialData?.lesson.objectives_km || []).join("\n")}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
            />
          </div>
        </div>

        {/* Publish status */}
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Status <span className="text-red-500">*</span>
          </span>
          <div className="flex gap-3">
            {(["Draft", "Published"] as const).map((s) => (
              <label
                key={s}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-colors has-[:checked]:border-[#0ea5e9] has-[:checked]:bg-sky-50"
              >
                <input
                  type="radio"
                  name="status"
                  value={s}
                  defaultChecked={s === defaultStatus}
                  className="accent-[#0ea5e9]"
                />
                {s}
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Only <strong className="font-semibold text-slate-600">Published</strong> lessons appear on the public Education page.
          </p>
        </div>

        {/* Thumbnail */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-600">
            Thumbnail <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <div className="flex gap-2">
            {(["url", "upload"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setThumbnailMode(mode)}
                className={[
                  "rounded-lg px-4 py-2 text-sm font-semibold transition",
                  thumbnailMode === mode
                    ? "bg-[#0ea5e9] text-white shadow-sm"
                    : "border border-slate-200 text-slate-600 hover:border-[#0ea5e9] hover:text-[#0ea5e9]",
                ].join(" ")}
              >
                {mode === "url" ? "Paste URL" : "Upload image"}
              </button>
            ))}
          </div>

          {thumbnailMode === "url" ? (
            <input
              type="url"
              placeholder="https://example.com/thumbnail.jpg"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
            />
          ) : (
            <R2Uploader
              bucketName="trading-tool"
              accept="image/png,image/jpeg,image/webp,image/gif"
              label="Thumbnail image"
              hint="PNG, JPG, WebP, GIF — max 20 MB"
              initialUrl={thumbnailUrl || undefined}
              onUploaded={(url) => setThumbnailUrl(url)}
            />
          )}

          {thumbnailUrl ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt="Thumbnail preview"
                className="mx-auto max-h-40 w-full object-contain"
              />
            </div>
          ) : null}

          <p className="text-xs text-slate-400">
            Used on course cards. If empty, the first YouTube video thumbnail is used when available.
          </p>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : (isEditing ? "Update Lesson" : "Create Lesson")}
        </button>
      </form>
    </div>
    {ConfirmDialogHost}
    </>
  );
}
