"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { createPodcast, updatePodcast } from "@/lib/supabase/actions";
import type { Podcast } from "@/lib/supabase/podcasts";
import { extractYouTubeVideoId } from "@/lib/youtube";

interface Props {
 podcast?: Podcast;
}

export function PodcastForm({ podcast }: Props) {
 const isEdit = !!podcast;
 const [isSaving, setIsSaving] = useState(false);

 const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
 e.preventDefault();
 const form = e.currentTarget;
 const formData = new FormData(form);

 const youtube_url = (formData.get("youtube_url") as string)?.trim() ?? "";
 const title_en = (formData.get("title_en") as string)?.trim() ?? "";
 const title_km = (formData.get("title_km") as string)?.trim() ?? "";
 const description_en = (formData.get("description_en") as string)?.trim() ?? "";
 const description_km = (formData.get("description_km") as string)?.trim() ?? "";
 const sortRaw = formData.get("sort_order") as string;
 const sort_order = Number.parseInt(sortRaw, 10);
 const status = formData.get("status") as string;

 if (!youtube_url || !title_en || !title_km) {
 toast.error("YouTube URL and both titles are required");
 return;
 }
 if (!extractYouTubeVideoId(youtube_url)) {
 toast.error("Could not read a YouTube video from that URL");
 return;
 }
 if (!Number.isFinite(sort_order)) {
 toast.error("Sort order must be a number");
 return;
 }

 setIsSaving(true);
 try {
 const payload = {
 youtube_url,
 title_en,
 title_km,
 description_en: description_en || undefined,
 description_km: description_km || undefined,
 sort_order,
 status: (status === "Published" ? "published" : "draft") as "draft" | "published",
 };

 const result = isEdit
 ? await updatePodcast(podcast.id, payload)
 : await createPodcast(payload);

 if (result.error) {
 toast.error(result.error);
 } else {
 toast.success(isEdit ? "Episode updated" : "Episode saved");
 setTimeout(() => {
 window.location.href = "/admin/podcasts";
 }, 900);
 }
 } catch (err) {
 toast.error(err instanceof Error ? err.message : "Failed to save");
 } finally {
 setIsSaving(false);
 }
 };

 const defaultStatus = podcast?.status === "published" ? "Published" : "Draft";

 return (
 <div className="w-full rounded-xl border border-slate-200 bg-white p-6">
 <h2 className="mb-6 text-base font-bold text-[#1e293b]">Episode details</h2>

 <form className="space-y-5" onSubmit={handleSubmit}>
 <div>
 <label htmlFor="youtube_url" className="mb-1.5 block text-xs font-semibold text-slate-600">
 YouTube URL or video ID
 </label>
 <input
 id="youtube_url"
 name="youtube_url"
 type="text"
 required
 defaultValue={podcast?.youtube_url ?? ""}
 placeholder="https://www.youtube.com/watch?v=… or youtu.be/…"
 className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-[#0ea5e9]/30 transition focus:ring-2"
 />
 <p className="mt-1 text-xs text-slate-400">
 Paste a watch link, Shorts link, embed URL, or the 11-character video id.
 </p>
 </div>

 <div className="grid gap-4 sm:grid-cols-2">
 <div>
 <label htmlFor="title_en" className="mb-1.5 block text-xs font-semibold text-slate-600">
 Title (English)
 </label>
 <input
 id="title_en"
 name="title_en"
 type="text"
 required
 defaultValue={podcast?.title_en ?? ""}
 className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-[#0ea5e9]/30 transition focus:ring-2"
 />
 </div>
 <div>
 <label htmlFor="title_km" className="mb-1.5 block text-xs font-semibold text-slate-600">
 Title (Khmer)
 </label>
 <input
 id="title_km"
 name="title_km"
 type="text"
 required
 defaultValue={podcast?.title_km ?? ""}
 className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-[#0ea5e9]/30 transition focus:ring-2"
 />
 </div>
 </div>

 <div className="grid gap-4 sm:grid-cols-2">
 <div>
 <label htmlFor="description_en" className="mb-1.5 block text-xs font-semibold text-slate-600">
 Description (English)
 </label>
 <textarea
 id="description_en"
 name="description_en"
 rows={4}
 defaultValue={podcast?.description_en ?? ""}
 className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-[#0ea5e9]/30 transition focus:ring-2"
 />
 </div>
 <div>
 <label htmlFor="description_km" className="mb-1.5 block text-xs font-semibold text-slate-600">
 Description (Khmer)
 </label>
 <textarea
 id="description_km"
 name="description_km"
 rows={4}
 defaultValue={podcast?.description_km ?? ""}
 className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-[#0ea5e9]/30 transition focus:ring-2"
 />
 </div>
 </div>

 <div className="grid gap-4 sm:grid-cols-2">
 <div>
 <label htmlFor="sort_order" className="mb-1.5 block text-xs font-semibold text-slate-600">
 Sort order
 </label>
 <input
 id="sort_order"
 name="sort_order"
 type="number"
 required
 defaultValue={podcast?.sort_order ?? 0}
 className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-[#0ea5e9]/30 transition focus:ring-2"
 />
 <p className="mt-1 text-xs text-slate-400">Higher numbers appear first on the site.</p>
 </div>
 <div>
 <span className="mb-1.5 block text-xs font-semibold text-slate-600">Status</span>
 <div className="flex gap-3 pt-1">
 {(["Draft", "Published"] as const).map((s) => (
 <label
 key={s}
 className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-colors has-checked:border-[#0ea5e9] has-checked:bg-sky-50"
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
 </div>
 </div>

 <div className="flex flex-wrap gap-3 pt-2">
 <button
 type="submit"
 disabled={isSaving}
 className="rounded-lg bg-[#0ea5e9] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:opacity-50"
 >
 {isSaving ? "Saving…" : isEdit ? "Save changes" : "Create episode"}
 </button>
 </div>
 </form>
 </div>
 );
}
