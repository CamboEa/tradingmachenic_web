"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { createLesson, updateLesson } from "@/lib/supabase/actions";
import { R2Uploader } from "@/components/r2-uploader";

type LessonType = "free" | "paid";

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

export function LessonForm({ initialData, isEditing = false }: LessonFormProps) {
  const [lessonType, setLessonType] = useState<LessonType>(
    initialData?.lesson.type || "free"
  );
  const [videos, setVideos] = useState<
    Array<{ embedUrl: string; titles: { en: string; km: string } }>
  >(
    initialData?.videos.map((v) => ({
      embedUrl: v.embed_url,
      titles: { en: v.title_en || "", km: v.title_km || "" },
    })) || []
  );
  const [paidVideos, setPaidVideos] = useState<
    Array<{ url: string; titles: { en: string; km: string } }>
  >([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (videos.length === 0 && paidVideos.length === 0) {
      toast.error("Please add at least one video");
      return;
    }

    if (lessonType === "paid" && paidVideos.some(v => !v.url)) {
      toast.error("Please upload all paid videos before submitting");
      return;
    }

    setIsSaving(true);
    const form = e.currentTarget;
    
    try {
      const slug = (form.querySelector('input[name="slug"]') as HTMLInputElement)?.value;
      const title_en = (form.querySelector('input[name="title_en"]') as HTMLInputElement)?.value;
      const title_km = (form.querySelector('input[name="title_km"]') as HTMLInputElement)?.value;
      const summary_en = (form.querySelector('textarea[name="summary_en"]') as HTMLTextAreaElement)?.value;
      const summary_km = (form.querySelector('textarea[name="summary_km"]') as HTMLTextAreaElement)?.value;
      const approximate_minutes = parseInt((form.querySelector('input[name="approximate_minutes"]') as HTMLInputElement)?.value || "0");

      if (!slug || !title_en || !title_km || !summary_en || !summary_km) {
        toast.error("Please fill in all required fields");
        setIsSaving(false);
        return;
      }

      const videosToSave = lessonType === "free" 
        ? videos.map(v => ({ embedUrl: v.embedUrl, title_en: v.titles.en, title_km: v.titles.km }))
        : paidVideos.map(v => ({ url: v.url, title_en: v.titles.en, title_km: v.titles.km }));

      if (isEditing && initialData) {
        const result = await updateLesson(slug, {
          title_en,
          title_km,
          summary_en,
          summary_km,
          approximate_minutes,
          type: lessonType,
          videos: videosToSave,
        });

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Lesson updated successfully!");
          // Refresh page after a short delay
          setTimeout(() => window.location.reload(), 1500);
        }
      } else {
        const result = await createLesson({
          slug,
          title_en,
          title_km,
          summary_en,
          summary_km,
          approximate_minutes,
          type: lessonType,
          videos: videosToSave,
        });

        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Lesson created successfully!");
          // Redirect after a short delay
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

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

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

  const removePaidVideo = (index: number) => {
    setPaidVideos(paidVideos.filter((_, i) => i !== index));
  };

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

        {/* Slug */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="slug"
            placeholder="e.g. price-action-basics"
            defaultValue={initialData?.lesson.slug || ""}
            disabled={isEditing}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-slate-400">
            Unique identifier for this lesson (no spaces, use hyphens){isEditing && " — Cannot be changed"}
          </p>
        </div>

        {/* Title EN */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Title (English) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title_en"
            placeholder="e.g. Price Action Basics"
            defaultValue={initialData?.lesson.title_en || ""}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
          />
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
            defaultValue={initialData?.lesson.title_km || ""}
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
            defaultValue={initialData?.lesson.summary_en || ""}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
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
            defaultValue={initialData?.lesson.summary_km || ""}
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
                      onClick={() => removeVideo(idx)}
                      className="text-xs font-semibold text-red-500 transition hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-600">
                        Embed URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://www.youtube.com/embed/..."
                        value={video.embedUrl}
                        onChange={(e) =>
                          updateVideo(idx, "embedUrl", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
                      />
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
                      onClick={() => removePaidVideo(idx)}
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
                      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                        <p className="break-all text-xs text-green-800">
                          {video.url}
                        </p>
                      </div>
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
              rows={3}
              placeholder="• គោលបំណង ១&#10;• គោលបំណង ២&#10;• គោលបំណង ៣"
              defaultValue={(initialData?.lesson.objectives_km || []).join("\n")}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
            />
          </div>
        </div>

        {/* Thumbnail URL */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Thumbnail URL <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            type="url"
            placeholder="https://..."
            defaultValue={initialData?.lesson.thumbnail_url || ""}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20"
          />
          <p className="mt-1 text-xs text-slate-400">
            Falls back to first video thumbnail if not provided
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
  );
}
