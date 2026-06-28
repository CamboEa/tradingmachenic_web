"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { createTool, updateTool } from "@/lib/supabase/actions";
import { R2Uploader } from "@/components/shared/r2-uploader";
import { ToolDocEditor } from "@/components/tools/tool-doc-editor";
import type { Tool } from "@/lib/supabase/tools";
import { slugify } from "@/lib/slug";
import { FIELD_CLASS } from "@/lib/ui/styles";

/**
 * Builds a Khmer translation template from English HTML.
 *
 * - Text blocks (p, h1-h3, li, blockquote) are EMPTIED and given
 *   data-km-hint="<english text>" so the CSS ::before rule in globals.css
 *   renders a yellow dashed placeholder showing what needs translating.
 * - Images and video embeds are kept EXACTLY in place (same src, alignment, size).
 * - All block structure is preserved so the layout mirrors English.
 */
function buildKhmerTemplate(html: string): string {
  if (typeof document === "undefined" || !html.trim()) return "";
  const root = document.createElement("div");
  root.innerHTML = html;

  const TEXT_TAGS = new Set(["P", "H1", "H2", "H3", "LI", "BLOCKQUOTE"]);

  function walk(el: Element) {
    // Never touch media — keep images/videos in exactly the same position
    if (
      el.tagName === "IMG" ||
      el.tagName === "IFRAME" ||
      el.hasAttribute("data-video-embed")
    ) return;

    if (TEXT_TAGS.has(el.tagName)) {
      // If the block contains media, recurse into children instead of clearing
      if (el.querySelector("img, [data-video-embed]")) {
        Array.from(el.children).forEach(walk);
        return;
      }
      const english = el.textContent?.trim() ?? "";
      if (english) {
        el.setAttribute("data-km-hint", english);
        el.textContent = ""; // Empty — CSS ::before shows the hint
      }
      return;
    }

    // Recurse into containers (ul, ol, div, etc.)
    Array.from(el.children).forEach(walk);
  }

  Array.from(root.children).forEach(walk);
  return root.innerHTML;
}

const TOOL_TYPES = ["Indicator", "Expert Advisor (EA)"] as const;
const PLATFORMS = ["MT4", "MT5", "MT4 & MT5"] as const;

const STEPS = [
  { title: "Basics",          hint: "Type, pricing, name, version, platform" },
  { title: "Content",         hint: "Write your full document — descriptions, how it works, proof, and media" },
  { title: "Files & publish", hint: "Download files, preview image, and publish status" },
] as const;

const fieldClass = FIELD_CLASS;

interface Props { tool?: Tool }

function readFormString(form: HTMLFormElement, name: string): string {
  const raw = new FormData(form).get(name);
  return typeof raw === "string" ? raw.trim() : "";
}

export function ToolsForm({ tool }: Props) {
  const isEdit = !!tool;
  const formRef = useRef<HTMLFormElement>(null);

  const [step, setStep]         = useState(0);
  const [langTab, setLangTab]   = useState<"en" | "km">("en");
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>(
    (tool?.platform as (typeof PLATFORMS)[number]) ?? "MT4",
  );

  // Rich content (stored as HTML)
  const [contentEn, setContentEn] = useState<string>(
    [
      tool?.description_en,
      tool?.requirements_en,
      tool?.how_it_works_en,
      tool?.key_features_en,
      tool?.usage_notes_en,
      tool?.proof_of_testing_en,
    ]
      .filter(Boolean)
      .join("\n") || "",
  );
  const [contentKm, setContentKm] = useState<string>(
    [
      tool?.description_km,
      tool?.requirements_km,
      tool?.how_it_works_km,
      tool?.key_features_km,
      tool?.usage_notes_km,
      tool?.proof_of_testing_km,
    ]
      .filter(Boolean)
      .join("\n") || "",
  );

  const [uploadedFileUrl,     setUploadedFileUrl]     = useState<string | null>(tool?.file_url     ?? null);
  const [uploadedFileUrlMt4,  setUploadedFileUrlMt4]  = useState<string | null>(tool?.file_url_mt4 ?? null);
  const [uploadedFileUrlMt5,  setUploadedFileUrlMt5]  = useState<string | null>(tool?.file_url_mt5 ?? null);
  const [uploadedImageUrl,    setUploadedImageUrl]    = useState<string | null>(tool?.image_url    ?? null);
  const [isSaving,            setIsSaving]            = useState(false);
  const [fileError,           setFileError]           = useState(false);
  const fileUploaderRef = useRef<HTMLDivElement>(null);

  const defaultType    = tool?.type    === "ea"        ? "Expert Advisor (EA)" : "Indicator";
  const defaultPricing = tool?.pricing === "paid"      ? "Paid"                : "Free";
  const defaultStatus  = tool?.status  === "published" ? "Published"           : "Draft";

  const isLastStep    = step === STEPS.length - 1;
  const isDualPlatform = platform === "MT4 & MT5";
  const fileReady     = isDualPlatform
    ? !!uploadedFileUrlMt4 && !!uploadedFileUrlMt5
    : !!uploadedFileUrl;

  function toolKeyPrefix(): string {
    const form = formRef.current;
    const typeFolder =
      (form ? readFormString(form, "toolType") : defaultType) === "Indicator"
        ? "indicator"
        : "expert_advisor";
    const name     = form ? readFormString(form, "toolName") : tool?.name ?? "";
    const nameSlug = slugify(name) || "untitled";
    return `${typeFolder}/${nameSlug}`;
  }

  function validateStep(index: number): boolean {
    const form = formRef.current;
    if (!form) return false;
    if (index === 0) {
      const name     = readFormString(form, "toolName");
      const version  = readFormString(form, "version");
      const toolType = readFormString(form, "toolType");
      const pricing  = readFormString(form, "pricing");
      const platform = readFormString(form, "platform");
      if (!name || !version || !toolType || !pricing || !platform) {
        toast.error("Please complete all fields in Basics");
        return false;
      }
    }
    if (index === STEPS.length - 1) {
      if (isDualPlatform) {
        if (!uploadedFileUrlMt4 || !uploadedFileUrlMt5) {
          toast.error("Please upload both MT4 and MT5 files");
          setFileError(true);
          setTimeout(() => fileUploaderRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
          return false;
        }
      } else if (!uploadedFileUrl) {
        toast.error("Please upload a tool file before publishing");
        setFileError(true);
        setTimeout(() => fileUploaderRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
        return false;
      }
    }
    return true;
  }

  function goToStep(next: number) {
    setFileError(false);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNext() {
    // In edit mode skip validation — all data already exists
    if (!isEdit && !validateStep(step)) return;
    if (step < STEPS.length - 1) goToStep(step + 1);
  }

  function handleBack() {
    if (step > 0) goToStep(step - 1);
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLastStep) { handleNext(); return; }
    const form = formRef.current;
    if (!form || !validateStep(step)) return;

    setIsSaving(true);
    try {
      const payload = {
        name:             readFormString(form, "toolName"),
        type:             (readFormString(form, "toolType") === "Indicator" ? "indicator" : "ea") as "indicator" | "ea",
        platform:         readFormString(form, "platform") as "MT4" | "MT5" | "MT4 & MT5",
        pricing:          (readFormString(form, "pricing") === "Free" ? "free" : "paid") as "free" | "paid",
        version:          readFormString(form, "version"),
        description_en:   contentEn || undefined,
        description_km:   contentKm || undefined,
        // Legacy fields cleared — content is now in the doc editor
        requirements_en:  undefined,
        requirements_km:  undefined,
        how_it_works_en:  undefined,
        how_it_works_km:  undefined,
        key_features_en:  undefined,
        key_features_km:  undefined,
        usage_notes_en:   undefined,
        usage_notes_km:   undefined,
        proof_of_testing_en: undefined,
        proof_of_testing_km: undefined,
        gallery:          [],
        file_url:         isDualPlatform ? undefined : uploadedFileUrl     ?? undefined,
        file_url_mt4:     isDualPlatform ? uploadedFileUrlMt4 ?? undefined : undefined,
        file_url_mt5:     isDualPlatform ? uploadedFileUrlMt5 ?? undefined : undefined,
        image_url:        uploadedImageUrl  || undefined,
        install_guide_url: undefined,
        status:           (readFormString(form, "status") === "Published" ? "published" : "draft") as "draft" | "published",
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
    <div className="w-full rounded-xl border border-bridge/40 bg-surface">
      {/* Step progress */}
      <div className="border-b border-bridge/30 px-4 py-5 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 className="mt-1 text-base font-bold text-foreground">{STEPS[step].title}</h2>
        <p className="mt-0.5 text-sm text-ink-soft">{STEPS[step].hint}</p>

        <ol className="mt-5 flex flex-wrap gap-2" aria-label="Form progress">
          {STEPS.map((s, i) => {
            const done   = i < step;
            const active = i === step;
            return (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => {
                    if (isEdit) {
                      // Edit mode: jump freely to any step, no validation gate
                      goToStep(i);
                    } else if (i < step) {
                      goToStep(i);
                    } else if (i > step) {
                      for (let j = step; j < i; j++) {
                        if (!validateStep(j)) return;
                      }
                      goToStep(i);
                    }
                  }}
                  disabled={!isEdit && i > step}
                  className={[
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-left text-xs font-semibold transition",
                    active ? "border-gold bg-teal/5 text-foreground"
                           : done || isEdit ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15"
                                            : "border-bridge/40 bg-surface-soft text-ink-soft",
                    !isEdit && i > step ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                  ].join(" ")}
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className={[
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]",
                      active ? "bg-teal text-white"
                             : done  ? "bg-emerald-500 text-white"
                                     : "bg-bridge/40 text-ink-soft",
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

        {/* ── Step 1: Basics ── */}
        <div className={step === 0 ? "space-y-5" : "hidden"}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Tool type</label>
            <div className="flex flex-wrap gap-3">
              {TOOL_TYPES.map((t) => (
                <label key={t} className="flex cursor-pointer items-center gap-2 rounded-lg border border-bridge/40 px-4 py-2.5 text-sm transition-colors has-checked:border-gold has-checked:bg-teal/5">
                  <input type="radio" name="toolType" value={t} defaultChecked={t === defaultType} className="accent-teal" />
                  {t}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Pricing</label>
            <div className="flex gap-3">
              {["Free", "Paid"].map((p) => (
                <label key={p} className="flex cursor-pointer items-center gap-2 rounded-lg border border-bridge/40 px-4 py-2.5 text-sm transition-colors has-checked:border-gold has-checked:bg-teal/5">
                  <input type="radio" name="pricing" value={p} defaultChecked={p === defaultPricing} className="accent-teal" />
                  {p}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
              Name <span className="text-red-500">*</span>
            </label>
            <input type="text" name="toolName" defaultValue={tool?.name} placeholder="e.g. TM Risk Manager v1" className={fieldClass} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
                Version <span className="text-red-500">*</span>
              </label>
              <input type="text" name="version" defaultValue={tool?.version} placeholder="e.g. 1.0.0" className={fieldClass} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Platform</label>
              <select name="platform" value={platform} onChange={(e) => setPlatform(e.target.value as (typeof PLATFORMS)[number])} className={fieldClass}>
                {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── Step 2: Content (Google Docs style) ── */}
        <div className={step === 1 ? "space-y-5" : "hidden"}>

          {/* Language tabs */}
          <div className="flex gap-1 rounded-xl border border-bridge/40 bg-surface-soft p-1 w-fit">
            {(["en", "km"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => {
                  if (lang === "km" && !contentKm.trim() && contentEn.trim()) {
                    // First time opening Khmer — seed it with the English
                    // structure so images stay and text shows where to translate
                    setContentKm(buildKhmerTemplate(contentEn));
                  }
                  setLangTab(lang);
                }}
                className={[
                  "rounded-lg px-5 py-2 text-sm font-semibold transition",
                  langTab === lang
                    ? "bg-teal text-white shadow-sm"
                    : "text-ink-soft hover:text-foreground",
                ].join(" ")}
              >
                {lang === "en" ? "🇺🇸 English" : "🇰🇭 Khmer"}
              </button>
            ))}
          </div>

          <p className="text-xs text-ink-soft">
            Write your full tool document — use headings to organise sections like Description, How it works, Requirements, Key features, Proof of testing. Embed images and videos inline.
          </p>

          {/* Only mount the active editor — prevents two Tiptap instances fighting */}
          {langTab === "en" && (
            <ToolDocEditor
              key="editor-en"
              value={contentEn}
              onChange={setContentEn}
              placeholder="Start writing the English content for this tool…"
              getKeyPrefix={toolKeyPrefix}
            />
          )}
          {langTab === "km" && (
            <ToolDocEditor
              key="editor-km"
              value={contentKm}
              onChange={setContentKm}
              placeholder="ចាប់ផ្ដើមសរសេរខ្លឹមសារជាភាសាខ្មែរ…"
              getKeyPrefix={toolKeyPrefix}
            />
          )}

        </div>

        {/* ── Step 3: Files & publish ── */}
        <div className={step === 2 ? "space-y-5" : "hidden"}>
          <div
            ref={fileUploaderRef}
            className={["space-y-5 rounded-xl transition", fileError ? "ring-2 ring-red-400 ring-offset-4" : ""].join(" ")}
          >
            {fileError && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400">
                A tool file is required before publishing.
              </p>
            )}
            {isDualPlatform ? (
              <>
                <R2Uploader
                  bucketName="trading-tool" accept=".ex4,.mq4,.zip"
                  label={<>MT4 file <span className="text-red-500">*</span></>}
                  hint=".ex4, .mq4, .zip — max 20 MB"
                  initialUrl={tool?.file_url_mt4 ?? undefined}
                  onUploaded={(url) => { setUploadedFileUrlMt4(url); setFileError(false); }}
                  getKeyPrefix={toolKeyPrefix}
                />
                <R2Uploader
                  bucketName="trading-tool" accept=".ex5,.mq5,.zip"
                  label={<>MT5 file <span className="text-red-500">*</span></>}
                  hint=".ex5, .mq5, .zip — max 20 MB"
                  initialUrl={tool?.file_url_mt5 ?? undefined}
                  onUploaded={(url) => { setUploadedFileUrlMt5(url); setFileError(false); }}
                  getKeyPrefix={toolKeyPrefix}
                />
              </>
            ) : (
              <R2Uploader
                bucketName="trading-tool" accept=".ex4,.ex5,.mq4,.mq5,.zip"
                label={<>Tool file <span className="text-red-500">*</span></>}
                hint=".ex4, .ex5, .mq4, .mq5, .zip — max 20 MB"
                initialUrl={tool?.file_url ?? undefined}
                onUploaded={(url) => { setUploadedFileUrl(url); setFileError(false); }}
                getKeyPrefix={toolKeyPrefix}
              />
            )}
          </div>

          <R2Uploader
            bucketName="trading-tool" accept="image/png,image/jpeg,image/webp"
            label={<>Preview image <span className="font-normal text-ink-soft">(optional)</span></>}
            hint="PNG, JPG, WebP — max 20 MB"
            initialUrl={tool?.image_url ?? undefined}
            onUploaded={(url) => setUploadedImageUrl(url)}
            getKeyPrefix={toolKeyPrefix}
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">Status</label>
            <div className="flex gap-3">
              {["Draft", "Published"].map((s) => (
                <label key={s} className="flex cursor-pointer items-center gap-2 rounded-lg border border-bridge/40 px-4 py-2.5 text-sm transition-colors has-checked:border-gold has-checked:bg-teal/5">
                  <input type="radio" name="status" value={s} defaultChecked={s === defaultStatus} className="accent-teal" />
                  {s}
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-soft">Draft tools are hidden until published.</p>
          </div>
        </div>

        {/* ── Navigation ── */}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-bridge/30 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button" onClick={handleBack} disabled={step === 0 || isSaving}
            className="rounded-lg border border-bridge/40 px-4 py-2.5 text-sm font-semibold text-ink-muted transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {!isLastStep ? (
              <button type="button" onClick={handleNext} className="rounded-lg bg-teal px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110">
                Continue
              </button>
            ) : (
              <div className="flex flex-col items-end gap-1.5">
                {!fileReady && !isSaving && (
                  <p className="text-xs font-semibold text-amber-600">
                    {isDualPlatform ? "Upload both MT4 and MT5 files above first" : "Upload the tool file above first"}
                  </p>
                )}
                <button
                  type="submit" disabled={isSaving || !fileReady}
                  className="rounded-lg bg-teal px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSaving ? "Saving..." : isEdit ? "Save changes" : "Publish tool"}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
