"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { createTool, updateTool } from "@/lib/supabase/actions";
import { R2Uploader } from "@/components/r2-uploader";
import type { Tool } from "@/lib/supabase/tools";

const TOOL_TYPES = ["Indicator", "Expert Advisor (EA)"] as const;
const PLATFORMS = ["MT4", "MT5", "MT4 & MT5"] as const;

interface Props {
  tool?: Tool;
}

export function ToolsForm({ tool }: Props) {
  const isEdit = !!tool;

  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(tool?.file_url ?? null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(tool?.image_url ?? null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = formData.get("toolName") as string;
    const toolType = formData.get("toolType") as string;
    const pricing = formData.get("pricing") as string;
    const version = formData.get("version") as string;
    const platform = formData.get("platform") as string;
    const description_en = formData.get("description_en") as string;
    const description_km = formData.get("description_km") as string;
    const requirements_en = formData.get("requirements_en") as string;
    const requirements_km = formData.get("requirements_km") as string;
    const how_it_works_en = formData.get("how_it_works_en") as string;
    const how_it_works_km = formData.get("how_it_works_km") as string;
    const key_features_en = formData.get("key_features_en") as string;
    const key_features_km = formData.get("key_features_km") as string;
    const usage_notes_en = formData.get("usage_notes_en") as string;
    const usage_notes_km = formData.get("usage_notes_km") as string;
    const install_guide_url = formData.get("install_guide_url") as string;
    const status = formData.get("status") as string;

    if (!name || !toolType || !pricing || !version || !platform) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!uploadedFileUrl) {
      toast.error("Please upload a tool file");
      return;
    }

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
        file_url: uploadedFileUrl,
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

  const defaultType = tool?.type === "ea" ? "Expert Advisor (EA)" : "Indicator";
  const defaultPricing = tool?.pricing === "paid" ? "Paid" : "Free";
  const defaultStatus = tool?.status === "published" ? "Published" : "Draft";

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-base font-bold text-[#1e293b]">Tool details</h2>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Tool type */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tool type</label>
          <div className="flex gap-3">
            {TOOL_TYPES.map((t) => (
              <label key={t} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-colors has-checked:border-[#0ea5e9] has-checked:bg-sky-50">
                <input type="radio" name="toolType" value={t} defaultChecked={t === defaultType} className="accent-[#0ea5e9]" />
                {t}
              </label>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Pricing</label>
          <div className="flex gap-3">
            {["Free", "Paid"].map((p) => (
              <label key={p} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-colors has-checked:border-[#0ea5e9] has-checked:bg-sky-50">
                <input type="radio" name="pricing" value={p} defaultChecked={p === defaultPricing} className="accent-[#0ea5e9]" />
                {p}
              </label>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Name</label>
          <input type="text" name="toolName" defaultValue={tool?.name} placeholder="e.g. TM Risk Manager v1" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20" />
        </div>

        {/* Version */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Version</label>
          <input type="text" name="version" defaultValue={tool?.version} placeholder="e.g. 1.0.0" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20" />
        </div>

        {/* Platform */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Platform</label>
          <select name="platform" defaultValue={tool?.platform ?? "MT4"} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20">
            {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Description EN */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Description (English)</label>
          <textarea rows={3} name="description_en" defaultValue={tool?.description_en ?? ""} placeholder="What does this tool do? What problem does it solve?" className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20" />
        </div>

        {/* Description KM */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Description (Khmer)</label>
          <textarea rows={3} name="description_km" defaultValue={tool?.description_km ?? ""} placeholder="ការពិពណ៌នា..." className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20" />
        </div>

        <div className="border-t border-slate-100 pt-5">
          <h3 className="mb-1 text-sm font-bold text-[#1e293b]">Extra detail for the public page</h3>
          <p className="mb-4 text-xs text-slate-500">All optional. Shown on the tool page when filled. Use English and Khmer so both locales read well.</p>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">What to use with (English)</label>
              <textarea rows={3} name="requirements_en" defaultValue={tool?.requirements_en ?? ""} placeholder="Symbols, timeframes, account type, broker or VPS notes…" className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">What to use with (Khmer)</label>
              <textarea rows={3} name="requirements_km" defaultValue={tool?.requirements_km ?? ""} placeholder="គូរប្រាក់ កាលបរិច្ឆេទ ប្រភេគគណនី…" className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">How it works (English)</label>
              <textarea rows={4} name="how_it_works_en" defaultValue={tool?.how_it_works_en ?? ""} placeholder="Signals, logic, automation behavior, what appears on chart…" className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">How it works (Khmer)</label>
              <textarea rows={4} name="how_it_works_km" defaultValue={tool?.how_it_works_km ?? ""} className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Key features (English)</label>
              <textarea rows={4} name="key_features_en" defaultValue={tool?.key_features_en ?? ""} placeholder="One feature per line or short bullets…" className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Key features (Khmer)</label>
              <textarea rows={4} name="key_features_km" defaultValue={tool?.key_features_km ?? ""} className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Usage tips & risk (English)</label>
              <textarea rows={3} name="usage_notes_en" defaultValue={tool?.usage_notes_en ?? ""} placeholder="Recommended settings, limitations, risk disclaimer…" className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">Usage tips & risk (Khmer)</label>
              <textarea rows={3} name="usage_notes_km" defaultValue={tool?.usage_notes_km ?? ""} className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20" />
            </div>
          </div>
        </div>

        {/* Tool file upload */}
        <R2Uploader
          bucketName="trading-tool"
          accept=".ex4,.ex5,.mq4,.mq5,.zip"
          label="Tool File (.ex4 / .ex5 / .mq4 / .mq5)"
          hint=".ex4, .ex5, .mq4, .mq5, .zip — max 20 MB"
          initialUrl={tool?.file_url ?? undefined}
          onUploaded={(url) => setUploadedFileUrl(url)}
        />

        {/* Image upload */}
        <R2Uploader
          bucketName="trading-tool"
          accept="image/png,image/jpeg,image/webp"
          label={<>Preview Image <span className="font-normal text-slate-400">(optional)</span></>}
          hint="PNG, JPG, WebP — max 20 MB"
          initialUrl={tool?.image_url ?? undefined}
          onUploaded={(url) => setUploadedImageUrl(url)}
        />

        {/* Install guide URL */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Install guide URL <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input type="url" name="install_guide_url" defaultValue={tool?.install_guide_url ?? ""} placeholder="https://..." className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20" />
        </div>

        {/* Status */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">Status</label>
          <div className="flex gap-3">
            {["Draft", "Published"].map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-colors has-checked:border-[#0ea5e9] has-checked:bg-sky-50">
                <input type="radio" name="status" value={s} defaultChecked={s === defaultStatus} className="accent-[#0ea5e9]" />
                {s}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Publish Tool"}
        </button>
      </form>
    </div>
  );
}
