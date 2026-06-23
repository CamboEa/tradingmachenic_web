"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { createLesson, updateLesson } from "@/lib/supabase/actions";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { LocaleParityHint } from "@/components/shared/locale-parity-hint";
import { R2Uploader } from "@/components/shared/r2-uploader";
import { YoutubeUrlPreview } from "@/components/education/youtube-url-preview";
import { slugify } from "@/lib/slug";
import { educationCategorySlugs } from "@/lib/education-categories";
import type { Mentor } from "@/lib/mentors";
import { extractYouTubeVideoId, resolveLessonVideoEmbedUrl } from "@/lib/youtube";

type LessonType = "free" | "paid";

const STEPS = [
 { title: "Basics", hint: "Lesson type, titles, slug, and duration" },
 { title: "Summary", hint: "Short overview in English and Khmer" },
 { title: "Videos", hint: "YouTube links or uploaded video files" },
 { title: "Objectives", hint: "What learners will achieve" },
 { title: "Thumbnail & publish", hint: "Cover image and visibility" },
] as const;

const fieldClass =
 "w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#22332E] focus:bg-white focus:ring-2 focus:ring-[#22332E]/20";

function parseObjectives(value: string): string[] {
 return value
 .split("\n")
 .map((line) => line.trim().replace(/^[•\-*]\s*/, ""))
 .filter(Boolean);
}

function readFormString(form: HTMLFormElement, name: string): string {
 const raw = new FormData(form).get(name);
 return typeof raw === "string" ? raw.trim() : "";
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
  mentor_slug: string | null;
  category: string | null;
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
 mentors: Mentor[];
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

function validateVideos(lessonType: LessonType, videos: FreeVideo[], paidVideos: PaidVideo[]): boolean {
 if (lessonType === "free") {
 if (videos.length === 0) {
 toast.error("Please add at least one YouTube video");
 return false;
 }
 if (videos.some((v) => !v.embedUrl.trim())) {
 toast.error("Each free video needs a YouTube URL");
 return false;
 }
 if (videos.some((v) => !extractYouTubeVideoId(v.embedUrl))) {
 toast.error("Use a valid YouTube watch, share, or embed link for each free video");
 return false;
 }
 return true;
 }

 if (paidVideos.length === 0) {
 toast.error("Please add at least one paid video");
 return false;
 }
 if (paidVideos.some((v) => !v.url.trim())) {
 toast.error("Please upload all paid videos before continuing");
 return false;
 }
 return true;
}

export function LessonForm({ initialData, isEditing = false, mentors }: LessonFormProps) {
 const formRef = useRef<HTMLFormElement>(null);
 const initialVideos = initialVideoState(initialData);

 const [step, setStep] = useState(0);
 const [lessonType, setLessonType] = useState<LessonType>(
 initialData?.lesson.type || "free",
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
 const [mentorSlug, setMentorSlug] = useState(initialData?.lesson.mentor_slug ?? "");
 const [category, setCategory] = useState(initialData?.lesson.category ?? "");
 const [isSaving, setIsSaving] = useState(false);
 const { confirm, ConfirmDialogHost } = useConfirm();

 const originalSlug = initialData?.lesson.slug ?? "";
 const isLastStep = step === STEPS.length - 1;

 const defaultStatus = isEditing
 ? initialData?.lesson.status === "published"
 ? "Published"
 : "Draft"
 : "Published";

 function goToStep(next: number) {
 setStep(next);
 window.scrollTo({ top: 0, behavior: "smooth" });
 }

 function validateStep(index: number): boolean {
 const form = formRef.current;
 if (!form) return false;

 if (index === 0) {
 const minutes = parseInt(readFormString(form, "approximate_minutes"), 10);
 if (
 !titleEn.trim() ||
 !titleKm.trim() ||
 !slugify(slug) ||
 !Number.isFinite(minutes) ||
 minutes < 1
 ) {
 toast.error("Complete lesson type, titles, slug, and duration (at least 1 minute)");
 return false;
 }
 }

 if (index === 1) {
 if (!summaryEn.trim() || !summaryKm.trim()) {
 toast.error("Please add summaries in English and Khmer");
 return false;
 }
 }

 if (index === 2) {
 if (!validateVideos(lessonType, videos, paidVideos)) return false;
 }

 if (index === 3) {
 const objectives_en = parseObjectives(readFormString(form, "objectives_en"));
 const objectives_km = parseObjectives(readFormString(form, "objectives_km"));
 if (objectives_en.length === 0 || objectives_km.length === 0) {
 toast.error("Add at least one learning objective in English and Khmer");
 return false;
 }
 }

 return true;
 }

 function handleNext() {
 if (!validateStep(step)) return;
 if (step < STEPS.length - 1) goToStep(step + 1);
 }

 function handleBack() {
 if (step > 0) goToStep(step - 1);
 }

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

 const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
 e.preventDefault();

 if (!isLastStep) {
 handleNext();
 return;
 }

 const form = formRef.current;
 if (!form || !validateStep(step)) return;

 if (!validateVideos(lessonType, videos, paidVideos)) return;

 setIsSaving(true);

 try {
 const normalizedSlug = slugify(slug);
 const title_en = titleEn.trim();
 const title_km = titleKm.trim();
 const summary_en = summaryEn.trim();
 const summary_km = summaryKm.trim();
 const approximate_minutes = parseInt(readFormString(form, "approximate_minutes"), 10);
 const objectives_en = parseObjectives(readFormString(form, "objectives_en"));
 const objectives_km = parseObjectives(readFormString(form, "objectives_km"));
 const statusRaw = readFormString(form, "status") || defaultStatus;
 const status = statusRaw === "Published" ? "published" : "draft";

 const videosToSave =
 lessonType === "free"
 ? videos.map((v) => ({
 embedUrl: resolveLessonVideoEmbedUrl(v.embedUrl),
 title_en: v.titles.en,
 title_km: v.titles.km,
 }))
 : paidVideos.map((v) => ({
 url: v.url,
 title_en: v.titles.en,
 title_km: v.titles.km,
 }));

 const thumbnail_url = thumbnailUrl.trim() || null;
 const mentor_slug = mentorSlug.trim() || null;
 const lessonCategory = category.trim() || null;

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
 mentor_slug,
 category: lessonCategory,
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
 mentor_slug,
 category: lessonCategory,
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
 setTimeout(() => (window.location.href = "/admin/lessons"), 1500);
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
 locale?: string,
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
 locale?: string,
 ) => {
 const newVideos = [...paidVideos];
 if (field === "titles" && locale) {
 newVideos[index].titles[locale as "en" | "km"] = value;
 }
 setPaidVideos(newVideos);
 };

 const freeVideoSection = (
 <>
 <div className="flex items-center justify-between">
 <h3 className="font-semibold text-[#22332E]">YouTube videos</h3>
 <button
 type="button"
 onClick={addVideo}
 className="text-xs font-semibold text-[#22332E] transition hover:text-[#1D4ED8]"
 >
 + Add video
 </button>
 </div>

 {videos.map((video, idx) => (
 <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
 <div className="mb-3 flex items-center justify-between">
 <span className="text-xs font-semibold text-slate-600">Video {idx + 1}</span>
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
 onChange={(e) => updateVideo(idx, "embedUrl", e.target.value)}
 className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#22332E] focus:ring-2 focus:ring-[#22332E]/20"
 />
 <YoutubeUrlPreview url={video.embedUrl} />
 </div>

 <div>
 <label className="mb-1 block text-xs font-semibold text-slate-600">
 Video title (English)
 </label>
 <input
 type="text"
 placeholder="Optional heading for this video"
 value={video.titles.en}
 onChange={(e) => updateVideo(idx, "titles", e.target.value, "en")}
 className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#22332E] focus:ring-2 focus:ring-[#22332E]/20"
 />
 </div>

 <div>
 <label className="mb-1 block text-xs font-semibold text-slate-600">
 Video title (Khmer)
 </label>
 <input
 type="text"
 placeholder="ចំណងជើងវីដេអូ (ច្រើនឯក)"
 value={video.titles.km}
 onChange={(e) => updateVideo(idx, "titles", e.target.value, "km")}
 className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#22332E] focus:ring-2 focus:ring-[#22332E]/20"
 />
 </div>
 </div>
 </div>
 ))}

 {videos.length === 0 ? (
 <p className="text-sm text-slate-400">
 No videos yet. Click &quot;Add video&quot; to add a YouTube link.
 </p>
 ) : null}
 </>
 );

 const paidVideoSection = (
 <>
 <div className="flex items-center justify-between">
 <h3 className="font-semibold text-[#22332E]">Upload videos</h3>
 <button
 type="button"
 onClick={() => addPaidVideo("")}
 className="text-xs font-semibold text-[#22332E] transition hover:text-[#1D4ED8]"
 >
 + Add video
 </button>
 </div>

 {paidVideos.map((video, idx) => (
 <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
 <div className="mb-3 flex items-center justify-between">
 <span className="text-xs font-semibold text-slate-600">Video {idx + 1}</span>
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
 label="Video file"
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
 label="Video file"
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
 Video title (English)
 </label>
 <input
 type="text"
 placeholder="Optional heading for this video"
 value={video.titles.en}
 onChange={(e) => updatePaidVideo(idx, "titles", e.target.value, "en")}
 className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#22332E] focus:ring-2 focus:ring-[#22332E]/20"
 />
 </div>

 <div>
 <label className="mb-1 block text-xs font-semibold text-slate-600">
 Video title (Khmer)
 </label>
 <input
 type="text"
 placeholder="ចំណងជើងវីដេអូ (ច្រើនឯក)"
 value={video.titles.km}
 onChange={(e) => updatePaidVideo(idx, "titles", e.target.value, "km")}
 className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#22332E] focus:ring-2 focus:ring-[#22332E]/20"
 />
 </div>
 </div>
 </div>
 ))}

 {paidVideos.length === 0 ? (
 <p className="text-sm text-slate-400">
 No videos yet. Click &quot;Add video&quot; to upload a file.
 </p>
 ) : null}
 </>
 );

 return (
 <>
 <div className="w-full rounded-xl border border-slate-200 bg-white">
 <div className="border-b border-slate-100 px-4 py-5 sm:px-6">
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
 Step {step + 1} of {STEPS.length}
 </p>
 <h2 className="mt-1 text-base font-bold text-[#22332E]">{STEPS[step].title}</h2>
 <p className="mt-0.5 text-sm text-slate-500">{STEPS[step].hint}</p>

 <ol className="mt-5 flex flex-wrap gap-2" aria-label="Form progress">
 {STEPS.map((s, i) => {
 const done = i < step;
 const active = i === step;
 return (
 <li key={s.title}>
 <button
 type="button"
 onClick={() => {
 if (i < step) goToStep(i);
 else if (i > step) {
 for (let j = step; j < i; j++) {
 if (!validateStep(j)) return;
 }
 goToStep(i);
 }
 }}
 disabled={i > step}
 className={[
 "flex items-center gap-2 rounded-full border px-3 py-1.5 text-left text-xs font-semibold transition",
 active
 ? "border-[#22332E] bg-[#EEF8F7] text-[#22332E]"
 : done
 ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
 : "border-slate-200 bg-slate-50 text-slate-400",
 i > step ? "cursor-not-allowed opacity-60" : "cursor-pointer",
 ].join(" ")}
 aria-current={active ? "step" : undefined}
 >
 <span
 className={[
 "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]",
 active
 ? "bg-[#22332E] text-white"
 : done
 ? "bg-emerald-500 text-white"
 : "bg-slate-200 text-slate-500",
 ].join(" ")}
 >
 {done ? "✓" : i + 1}
 </span>
 <span className="hidden sm:inline">{s.title}</span>
 </button>
 </li>
 );
 })}
 </ol>
 </div>

 <form ref={formRef} className="p-4 sm:p-6" onSubmit={handleSubmit}>
 {/* Step 1 — Basics */}
 <div className={step === 0 ? "space-y-5" : "hidden"}>
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Lesson type <span className="text-red-500">*</span>
 </label>
 <div className="flex gap-3">
 {(["free", "paid"] as const).map((type) => (
 <label
 key={type}
 className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-colors has-[:checked]:border-[#22332E] has-[:checked]:bg-[#EEF8F7]"
 >
 <input
 type="radio"
 name="lessonType"
 value={type}
 checked={lessonType === type}
 onChange={(e) => setLessonType(e.target.value as LessonType)}
 className="accent-[#22332E]"
 />
 {type === "free" ? "Free (YouTube)" : "Paid (Cloudflare)"}
 </label>
 ))}
 </div>
 </div>

 <div className="grid gap-5 sm:grid-cols-2">
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Category
 </label>
 <select
 name="category"
 value={category}
 onChange={(e) => setCategory(e.target.value)}
 className={fieldClass}
 >
 <option value="">Not assigned</option>
 {educationCategorySlugs.map((value) => (
 <option key={value} value={value}>
 {value.charAt(0).toUpperCase() + value.slice(1)}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Mentor
 </label>
 <select
 name="mentor_slug"
 value={mentorSlug}
 onChange={(e) => setMentorSlug(e.target.value)}
 className={fieldClass}
 >
 <option value="">Not assigned</option>
 {mentors.map((mentor) => (
 <option key={mentor.slug} value={mentor.slug}>
 {mentor.names.en}
 </option>
 ))}
 </select>
 </div>
 </div>

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
 className={fieldClass}
 />
 <LocaleParityHint
 enFilled={titleEn.trim().length > 0}
 kmFilled={titleKm.trim().length > 0}
 />
 </div>

 <div>
 <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
 <label className="text-xs font-semibold text-slate-600">
 Slug <span className="text-red-500">*</span>
 </label>
 {slugTouched && titleEn.trim() ? (
 <button
 type="button"
 onClick={syncSlugFromTitle}
 className="text-xs font-semibold text-[#22332E] transition hover:text-[#1D4ED8]"
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
 className={`${fieldClass} font-mono`}
 />
 <p className="mt-1 text-xs text-slate-400">
 URL path for this lesson (e.g. /education/your-slug).
 </p>
 </div>

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
 className={fieldClass}
 />
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Approximate duration (minutes) <span className="text-red-500">*</span>
 </label>
 <input
 type="number"
 name="approximate_minutes"
 min={1}
 placeholder="45"
 defaultValue={initialData?.lesson.approximate_minutes || ""}
 className={fieldClass}
 />
 </div>
 </div>

 {/* Step 2 — Summary */}
 <div className={step === 1 ? "space-y-5" : "hidden"}>
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Summary (English) <span className="text-red-500">*</span>
 </label>
 <textarea
 rows={4}
 name="summary_en"
 placeholder="Brief overview of this lesson..."
 value={summaryEn}
 onChange={(e) => setSummaryEn(e.target.value)}
 className={`${fieldClass} resize-y`}
 />
 <LocaleParityHint
 enFilled={summaryEn.trim().length > 0}
 kmFilled={summaryKm.trim().length > 0}
 label="Khmer summary missing"
 />
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Summary (Khmer) <span className="text-red-500">*</span>
 </label>
 <textarea
 rows={4}
 name="summary_km"
 placeholder="ពិពណ៌នាសង្ខេប..."
 value={summaryKm}
 onChange={(e) => setSummaryKm(e.target.value)}
 className={`${fieldClass} resize-y`}
 />
 </div>
 </div>

 {/* Step 3 — Videos */}
 <div className={step === 2 ? "space-y-4" : "hidden"}>
 <p className="text-xs text-slate-500">
 {lessonType === "free"
 ? "Add one or more YouTube videos. Learners watch them embedded on the lesson page."
 : "Upload video files to Cloudflare R2. Each segment can have optional EN/KM titles."}
 </p>
 {lessonType === "free" ? freeVideoSection : paidVideoSection}
 </div>

 {/* Step 4 — Objectives */}
 <div className={step === 3 ? "space-y-5" : "hidden"}>
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Objectives (English) <span className="text-red-500">*</span>
 </label>
 <textarea
 name="objectives_en"
 rows={4}
 placeholder={"• Objective 1\n• Objective 2\n• Objective 3"}
 defaultValue={(initialData?.lesson.objectives_en || []).join("\n")}
 className={`${fieldClass} resize-y`}
 />
 <p className="mt-1 text-xs text-slate-400">One objective per line</p>
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Objectives (Khmer) <span className="text-red-500">*</span>
 </label>
 <textarea
 name="objectives_km"
 rows={4}
 placeholder={"• គោលបំណង ១\n• គោលបំណង ២\n• គោលបំណង ៣"}
 defaultValue={(initialData?.lesson.objectives_km || []).join("\n")}
 className={`${fieldClass} resize-y`}
 />
 </div>
 </div>

 {/* Step 5 — Thumbnail & publish */}
 <div className={step === 4 ? "space-y-5" : "hidden"}>
 <div>
 <span className="mb-1.5 block text-xs font-semibold text-slate-600">
 Status <span className="text-red-500">*</span>
 </span>
 <div className="flex gap-3">
 {(["Draft", "Published"] as const).map((s) => (
 <label
 key={s}
 className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-colors has-[:checked]:border-[#22332E] has-[:checked]:bg-[#EEF8F7]"
 >
 <input
 type="radio"
 name="status"
 value={s}
 defaultChecked={s === defaultStatus}
 className="accent-[#22332E]"
 />
 {s}
 </label>
 ))}
 </div>
 <p className="mt-2 text-xs text-slate-400">
 Only <strong className="font-semibold text-slate-600">Published</strong> lessons
 appear on the public Education page.
 </p>
 </div>

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
 ? "bg-[#22332E] text-white"
 : "border border-slate-200 text-slate-600 hover:border-[#22332E] hover:text-[#22332E]",
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
 className={fieldClass}
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
 Used on course cards. If empty, the first YouTube thumbnail is used when available.
 </p>
 </div>
 </div>

 <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
 <button
 type="button"
 onClick={handleBack}
 disabled={step === 0 || isSaving}
 className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
 >
 Back
 </button>

 <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
 {!isLastStep ? (
 <button
 type="button"
 onClick={handleNext}
 className="rounded-lg bg-[#22332E] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
 >
 Continue
 </button>
 ) : (
 <button
 type="submit"
 disabled={isSaving}
 className="rounded-lg bg-[#22332E] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:bg-slate-300"
 >
 {isSaving
 ? "Saving..."
 : isEditing
 ? "Save changes"
 : "Create lesson"}
 </button>
 )}
 </div>
 </div>
 </form>
 </div>
 {ConfirmDialogHost}
 </>
 );
}
