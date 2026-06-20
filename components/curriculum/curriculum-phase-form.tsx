"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { createCurriculumPhase, updateCurriculumPhase } from "@/lib/supabase/actions";
import type { CurriculumAccent } from "@/lib/curriculum";

type PhaseRow = {
 id: string;
 slug: string;
 accent: CurriculumAccent;
 sort_order: number;
 label_en: string;
 label_km: string;
 sublabel_en: string;
 sublabel_km: string;
};

interface Props {
 phase?: PhaseRow;
}

export function CurriculumPhaseForm({ phase }: Props) {
 const isEdit = !!phase;
 const [isSaving, setIsSaving] = useState(false);

 async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
 e.preventDefault();
 const form = e.currentTarget;
 const fd = new FormData(form);
 const slug = (fd.get("slug") as string) || "";
 const accent: CurriculumAccent = (fd.get("accent") as string) === "teal" ? "teal" : "gold";
 const sort_order = Number(fd.get("sort_order") || 0);
 const label_en = (fd.get("label_en") as string) || "";
 const label_km = (fd.get("label_km") as string) || "";
 const sublabel_en = (fd.get("sublabel_en") as string) || "";
 const sublabel_km = (fd.get("sublabel_km") as string) || "";

 if (!label_en || !label_km || !sublabel_en || !sublabel_km) {
 toast.error("Fill in all labels (EN and Khmer).");
 return;
 }

 setIsSaving(true);
 try {
 const payload = { slug, accent, sort_order, label_en, label_km, sublabel_en, sublabel_km };
 const result = isEdit
 ? await updateCurriculumPhase(phase.id, payload)
 : await createCurriculumPhase(payload);

 if (result.error) toast.error(result.error);
 else {
 toast.success(isEdit ? "Phase updated" : "Phase created");
 setTimeout(() => {
 window.location.href = "/admin/program";
 }, 800);
 }
 } catch (err) {
 toast.error(err instanceof Error ? err.message : "Save failed");
 } finally {
 setIsSaving(false);
 }
 }

 return (
 <div className="w-full rounded-xl border border-slate-200 bg-white p-6">
 <h2 className="mb-6 text-base font-bold text-[#0D1B33]">{isEdit ? "Edit phase" : "New phase"}</h2>
 <form className="space-y-5" onSubmit={handleSubmit}>
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">Slug</label>
 <input
 name="slug"
 required
 defaultValue={phase?.slug}
 readOnly={isEdit}
 placeholder="e.g. theory"
 className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1E3EE8] focus:bg-white read-only:cursor-default read-only:opacity-80"
 />
 <p className="mt-1 text-xs text-slate-400">
 {isEdit ? "Slug cannot be changed." : "Lowercase letters, numbers, hyphens."}
 </p>
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">Sort order</label>
 <input
 type="number"
 name="sort_order"
 defaultValue={phase?.sort_order ?? 0}
 className="w-full max-w-[10rem] rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1E3EE8] focus:bg-white"
 />
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">Timeline accent</label>
 <select
 name="accent"
 defaultValue={phase?.accent ?? "gold"}
 className="w-full max-w-xs rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1E3EE8] focus:bg-white"
 >
 <option value="gold">Gold (Phase I style)</option>
 <option value="teal">Teal (Phase II style)</option>
 </select>
 </div>

 <div className="grid gap-4 sm:grid-cols-2">
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">Title (English)</label>
 <input
 name="label_en"
 required
 defaultValue={phase?.label_en}
 className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1E3EE8] focus:bg-white"
 />
 </div>
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">Title (Khmer)</label>
 <input
 name="label_km"
 required
 defaultValue={phase?.label_km}
 className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1E3EE8] focus:bg-white"
 />
 </div>
 </div>

 <div className="grid gap-4 sm:grid-cols-2">
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">Subtitle (English)</label>
 <input
 name="sublabel_en"
 required
 defaultValue={phase?.sublabel_en}
 className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1E3EE8] focus:bg-white"
 />
 </div>
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">Subtitle (Khmer)</label>
 <input
 name="sublabel_km"
 required
 defaultValue={phase?.sublabel_km}
 className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#1E3EE8] focus:bg-white"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={isSaving}
 className="w-full rounded-lg bg-[#1E3EE8] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:bg-slate-300"
 >
 {isSaving ? "Saving…" : isEdit ? "Save phase" : "Create phase"}
 </button>
 </form>
 </div>
 );
}
