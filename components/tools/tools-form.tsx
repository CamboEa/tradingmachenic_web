"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { createTool, updateTool } from "@/lib/supabase/actions";
import { R2Uploader } from "@/components/shared/r2-uploader";
import { ToolGalleryEditor } from "@/components/tools/tool-gallery-editor";
import type { Tool } from "@/lib/supabase/tools";
import type { ToolGalleryItem } from "@/lib/supabase/tool-gallery";

const TOOL_TYPES = ["Indicator", "Expert Advisor (EA)"] as const;
const PLATFORMS = ["MT4", "MT5", "MT4 & MT5"] as const;

const STEPS = [
 { title: "Basics", hint: "Type, pricing, name, version, platform" },
 { title: "Description", hint: "Short overview in English and Khmer" },
 { title: "Page content", hint: "Requirements, how it works, features, usage" },
 { title: "Proof & gallery", hint: "Testing notes and screenshot images" },
 { title: "Files & publish", hint: "Downloads, preview, and status" },
] as const;

const fieldClass =
 "w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20";

interface Props {
 tool?: Tool;
}

function readFormString(form: HTMLFormElement, name: string): string {
 const raw = new FormData(form).get(name);
 return typeof raw === "string" ? raw.trim() : "";
}

export function ToolsForm({ tool }: Props) {
 const isEdit = !!tool;
 const formRef = useRef<HTMLFormElement>(null);

 const [step, setStep] = useState(0);
 const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(tool?.file_url ?? null);
 const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(tool?.image_url ?? null);
 const [galleryItems, setGalleryItems] = useState<ToolGalleryItem[]>(tool?.gallery ?? []);
 const [isSaving, setIsSaving] = useState(false);

 const defaultType = tool?.type === "ea" ? "Expert Advisor (EA)" : "Indicator";
 const defaultPricing = tool?.pricing === "paid" ? "Paid" : "Free";
 const defaultStatus = tool?.status === "published" ? "Published" : "Draft";

 const isLastStep = step === STEPS.length - 1;

 function validateStep(index: number): boolean {
 const form = formRef.current;
 if (!form) return false;

 if (index === 0) {
 const name = readFormString(form, "toolName");
 const version = readFormString(form, "version");
 const toolType = readFormString(form, "toolType");
 const pricing = readFormString(form, "pricing");
 const platform = readFormString(form, "platform");

 if (!name || !version || !toolType || !pricing || !platform) {
 toast.error("Please complete all fields in Basics");
 return false;
 }
 }

 if (index === STEPS.length - 1 && !uploadedFileUrl) {
 toast.error("Please upload a tool file before publishing");
 return false;
 }

 return true;
 }

 function goToStep(next: number) {
 setStep(next);
 window.scrollTo({ top: 0, behavior: "smooth" });
 }

 function handleNext() {
 if (!validateStep(step)) return;
 if (step < STEPS.length - 1) goToStep(step + 1);
 }

 function handleBack() {
 if (step > 0) goToStep(step - 1);
 }

 const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
 e.preventDefault();
 if (!isLastStep) {
 handleNext();
 return;
 }

 const form = formRef.current;
 if (!form || !validateStep(step)) return;

 const name = readFormString(form, "toolName");
 const toolType = readFormString(form, "toolType");
 const pricing = readFormString(form, "pricing");
 const version = readFormString(form, "version");
 const platform = readFormString(form, "platform");
 const description_en = readFormString(form, "description_en");
 const description_km = readFormString(form, "description_km");
 const requirements_en = readFormString(form, "requirements_en");
 const requirements_km = readFormString(form, "requirements_km");
 const how_it_works_en = readFormString(form, "how_it_works_en");
 const how_it_works_km = readFormString(form, "how_it_works_km");
 const key_features_en = readFormString(form, "key_features_en");
 const key_features_km = readFormString(form, "key_features_km");
 const usage_notes_en = readFormString(form, "usage_notes_en");
 const usage_notes_km = readFormString(form, "usage_notes_km");
 const proof_of_testing_en = readFormString(form, "proof_of_testing_en");
 const proof_of_testing_km = readFormString(form, "proof_of_testing_km");
 const install_guide_url = readFormString(form, "install_guide_url");
 const status = readFormString(form, "status");

 setIsSaving(true);

 try {
 const payload = {
 name,
 type: (toolType === "Indicator" ? "indicator" : "ea") as "indicator" | "ea",
 platform: platform as "MT4" | "MT5" | "MT4 & MT5",
 pricing: (pricing === "Free" ? "free" : "paid") as "free" | "paid",
 version,
 description_en: description_en || undefined,
 description_km: description_km || undefined,
 requirements_en: requirements_en || undefined,
 requirements_km: requirements_km || undefined,
 how_it_works_en: how_it_works_en || undefined,
 how_it_works_km: how_it_works_km || undefined,
 key_features_en: key_features_en || undefined,
 key_features_km: key_features_km || undefined,
 usage_notes_en: usage_notes_en || undefined,
 usage_notes_km: usage_notes_km || undefined,
 proof_of_testing_en: proof_of_testing_en || undefined,
 proof_of_testing_km: proof_of_testing_km || undefined,
 gallery: galleryItems,
 file_url: uploadedFileUrl!,
 image_url: uploadedImageUrl || undefined,
 install_guide_url: install_guide_url || undefined,
 status: (status === "Published" ? "published" : "draft") as "draft" | "published",
 };

 const result = isEdit
 ? await updateTool(tool.id, payload)
 : await createTool(payload);

 if (result.error) {
 toast.error(result.error);
 } else {
 toast.success(isEdit ? "Tool updated!" : "Tool published!");
 setTimeout(() => (window.location.href = "/admin/tools"), 1200);
 }
 } catch (err) {
 toast.error(err instanceof Error ? err.message : "Failed to save tool");
 } finally {
 setIsSaving(false);
 }
 };

 return (
 <div className="w-full rounded-xl border border-slate-200 bg-white">
 {/* Step progress */}
 <div className="border-b border-slate-100 px-4 py-5 sm:px-6">
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
 Step {step + 1} of {STEPS.length}
 </p>
 <h2 className="mt-1 text-base font-bold text-[#1e293b]">{STEPS[step].title}</h2>
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
 ? "border-[#0ea5e9] bg-sky-50 text-[#0ea5e9]"
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
 ? "bg-[#0ea5e9] text-white"
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
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tool type</label>
 <div className="flex flex-wrap gap-3">
 {TOOL_TYPES.map((t) => (
 <label
 key={t}
 className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-colors has-checked:border-[#0ea5e9] has-checked:bg-sky-50"
 >
 <input
 type="radio"
 name="toolType"
 value={t}
 defaultChecked={t === defaultType}
 className="accent-[#0ea5e9]"
 />
 {t}
 </label>
 ))}
 </div>
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">Pricing</label>
 <div className="flex gap-3">
 {["Free", "Paid"].map((p) => (
 <label
 key={p}
 className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-colors has-checked:border-[#0ea5e9] has-checked:bg-sky-50"
 >
 <input
 type="radio"
 name="pricing"
 value={p}
 defaultChecked={p === defaultPricing}
 className="accent-[#0ea5e9]"
 />
 {p}
 </label>
 ))}
 </div>
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Name <span className="text-red-500">*</span>
 </label>
 <input
 type="text"
 name="toolName"
 defaultValue={tool?.name}
 placeholder="e.g. TM Risk Manager v1"
 className={fieldClass}
 />
 </div>

 <div className="grid gap-5 sm:grid-cols-2">
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Version <span className="text-red-500">*</span>
 </label>
 <input
 type="text"
 name="version"
 defaultValue={tool?.version}
 placeholder="e.g. 1.0.0"
 className={fieldClass}
 />
 </div>
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">Platform</label>
 <select name="platform" defaultValue={tool?.platform ?? "MT4"} className={fieldClass}>
 {PLATFORMS.map((p) => (
 <option key={p}>{p}</option>
 ))}
 </select>
 </div>
 </div>
 </div>

 {/* Step 2 — Description */}
 <div className={step === 1 ? "space-y-5" : "hidden"}>
 <p className="text-xs text-slate-500">
 Optional but recommended. Shown at the top of the public tool page.
 </p>
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Description (English)
 </label>
 <textarea
 rows={4}
 name="description_en"
 defaultValue={tool?.description_en ?? ""}
 placeholder="What does this tool do? What problem does it solve?"
 className={`${fieldClass} resize-y`}
 />
 </div>
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Description (Khmer)
 </label>
 <textarea
 rows={4}
 name="description_km"
 defaultValue={tool?.description_km ?? ""}
 placeholder="ការពិពណ៌នា..."
 className={`${fieldClass} resize-y`}
 />
 </div>
 </div>

 {/* Step 3 — Page content */}
 <div className={step === 2 ? "space-y-4" : "hidden"}>
 <p className="text-xs text-slate-500">
 All optional. Each block appears on the tool page only when filled in.
 </p>
 {(
 [
 ["requirements_en", "requirements_km", "What to use with (English)", "What to use with (Khmer)", "Symbols, timeframes, account type…", "គូរប្រាក់ កាលបរិច្ឆេទ…", 3],
 ["how_it_works_en", "how_it_works_km", "How it works (English)", "How it works (Khmer)", "Signals, logic, chart behavior…", "", 4],
 ["key_features_en", "key_features_km", "Key features (English)", "Key features (Khmer)", "One feature per line…", "", 4],
 ["usage_notes_en", "usage_notes_km", "Usage tips & risk (English)", "Usage tips & risk (Khmer)", "Settings, limitations, disclaimer…", "", 3],
 ] as const
 ).map(([nameEn, nameKm, labelEn, labelKm, phEn, phKm, rows]) => (
 <div key={nameEn} className="grid gap-4 sm:grid-cols-2">
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">{labelEn}</label>
 <textarea
 rows={rows}
 name={nameEn}
 defaultValue={(tool?.[nameEn as keyof Tool] as string) ?? ""}
 placeholder={phEn}
 className={`${fieldClass} resize-y`}
 />
 </div>
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">{labelKm}</label>
 <textarea
 rows={rows}
 name={nameKm}
 defaultValue={(tool?.[nameKm as keyof Tool] as string) ?? ""}
 placeholder={phKm}
 className={`${fieldClass} resize-y`}
 />
 </div>
 </div>
 ))}
 </div>

 {/* Step 4 — Proof & gallery */}
 <div className={step === 3 ? "space-y-5" : "hidden"}>
 <p className="text-xs text-slate-500">
 Build trust with backtest notes and chart screenshots. Everything here is optional.
 </p>
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Proof of testing (English)
 </label>
 <textarea
 rows={4}
 name="proof_of_testing_en"
 defaultValue={tool?.proof_of_testing_en ?? ""}
 placeholder="Backtest period, symbol, timeframe, results summary…"
 className={`${fieldClass} resize-y`}
 />
 </div>
 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Proof of testing (Khmer)
 </label>
 <textarea
 rows={4}
 name="proof_of_testing_km"
 defaultValue={tool?.proof_of_testing_km ?? ""}
 placeholder="កាលបរិច្ឆេទ គូរប្រាក់ លទ្ធផលសាកល្បង…"
 className={`${fieldClass} resize-y`}
 />
 </div>
 <div className="border-t border-slate-100 pt-5">
 <h3 className="text-sm font-bold text-[#1e293b]">Proof images & screenshots</h3>
 <p className="mt-1 mb-4 text-xs text-slate-500">
 Upload images with English and Khmer captions for the gallery section.
 </p>
 <ToolGalleryEditor initialItems={tool?.gallery} onChange={setGalleryItems} />
 </div>
 </div>

 {/* Step 5 — Files & publish */}
 <div className={step === 4 ? "space-y-5" : "hidden"}>
 <R2Uploader
 bucketName="trading-tool"
 accept=".ex4,.ex5,.mq4,.mq5,.zip"
 label={
 <>
 Tool file <span className="text-red-500">*</span>
 </>
 }
 hint=".ex4, .ex5, .mq4, .mq5, .zip — max 20 MB"
 initialUrl={tool?.file_url ?? undefined}
 onUploaded={(url) => setUploadedFileUrl(url)}
 />

 <R2Uploader
 bucketName="trading-tool"
 accept="image/png,image/jpeg,image/webp"
 label={
 <>
 Preview image <span className="font-normal text-slate-400">(optional)</span>
 </>
 }
 hint="PNG, JPG, WebP — max 20 MB"
 initialUrl={tool?.image_url ?? undefined}
 onUploaded={(url) => setUploadedImageUrl(url)}
 />

 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">
 Install guide URL <span className="font-normal text-slate-400">(optional)</span>
 </label>
 <input
 type="url"
 name="install_guide_url"
 defaultValue={tool?.install_guide_url ?? ""}
 placeholder="https://..."
 className={fieldClass}
 />
 </div>

 <div>
 <label className="mb-1.5 block text-xs font-semibold text-slate-600">Status</label>
 <div className="flex gap-3">
 {["Draft", "Published"].map((s) => (
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
 <p className="mt-2 text-xs text-slate-500">
 Draft tools are hidden from the public site until published.
 </p>
 </div>
 </div>

 {/* Navigation */}
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
 className="rounded-lg bg-[#0ea5e9] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
 >
 Continue
 </button>
 ) : (
 <button
 type="submit"
 disabled={isSaving}
 className="rounded-lg bg-[#0ea5e9] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
 >
 {isSaving ? "Saving..." : isEdit ? "Save changes" : "Publish tool"}
 </button>
 )}
 </div>
 </div>
 </form>
 </div>
 );
}
