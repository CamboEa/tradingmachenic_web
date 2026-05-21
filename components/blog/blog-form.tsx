"use client";

import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { BlogVideoEditor, validateBlogVideos } from "@/components/blog/blog-video-editor";
import { createBlogPost, updateBlogPost } from "@/lib/supabase/actions";
import { R2Uploader } from "@/components/shared/r2-uploader";
import type { BlogPost } from "@/lib/supabase/blog";
import type { BlogVideoItem } from "@/lib/supabase/blog-videos";
import { slugify } from "@/lib/slug";

const STEPS = [
  { title: "Basics", hint: "Title, slug, excerpt, and publish date" },
  { title: "Article", hint: "Full article in English and Khmer" },
  { title: "Videos", hint: "Optional YouTube or uploaded clips" },
  { title: "Cover & publish", hint: "Featured image and visibility" },
] as const;

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/20";

const CONTENT_HINT = `Use ## for section headings, ### for subheadings, and - for bullet lists. Wrap emphasis in **double asterisks**.`;

function toDatetimeLocalValue(iso: string | undefined): string {
  if (!iso) {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function readFormString(form: HTMLFormElement, name: string): string {
  const raw = new FormData(form).get(name);
  return typeof raw === "string" ? raw.trim() : "";
}

export function BlogForm({ post }: { post?: BlogPost }) {
  const isEdit = !!post;
  const formRef = useRef<HTMLFormElement>(null);

  const [step, setStep] = useState(0);
  const [titleEn, setTitleEn] = useState(post?.title_en ?? "");
  const [titleKm, setTitleKm] = useState(post?.title_km ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!post?.slug);
  const [featuredUrl, setFeaturedUrl] = useState(post?.featured_image_url ?? "");
  const [videos, setVideos] = useState<BlogVideoItem[]>(post?.videos ?? []);
  const [isSaving, setIsSaving] = useState(false);

  const isLastStep = step === STEPS.length - 1;
  const defaultStatus = post?.status === "published" ? "Published" : "Draft";

  function goToStep(next: number) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleTitleEnChange(value: string) {
    setTitleEn(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function validateStep(index: number): boolean {
    const form = formRef.current;
    if (!form) return false;

    if (index === 0) {
      if (!titleEn.trim() || !titleKm.trim() || !slugify(slug)) {
        toast.error("Title (EN/KM) and slug are required");
        return false;
      }
      const publishedAt = readFormString(form, "published_at");
      if (!publishedAt) {
        toast.error("Please set a publish date");
        return false;
      }
    }

    if (index === 1) {
      const body_en = readFormString(form, "body_en");
      const body_km = readFormString(form, "body_km");
      if (!body_en || !body_km) {
        toast.error("Article body is required in both English and Khmer");
        return false;
      }
    }

    if (index === 2) {
      const videoError = validateBlogVideos(videos);
      if (videoError) {
        toast.error(videoError);
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

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLastStep) {
      handleNext();
      return;
    }

    const form = formRef.current;
    if (!form || !validateStep(step)) return;

    const payload = {
      slug: slugify(slug),
      title_en: titleEn.trim(),
      title_km: titleKm.trim(),
      excerpt_en: readFormString(form, "excerpt_en") || undefined,
      excerpt_km: readFormString(form, "excerpt_km") || undefined,
      body_en: readFormString(form, "body_en"),
      body_km: readFormString(form, "body_km"),
      featured_image_url: featuredUrl.trim() || undefined,
      published_at: new Date(readFormString(form, "published_at")).toISOString(),
      status: (readFormString(form, "status") === "Published" ? "published" : "draft") as
        | "draft"
        | "published",
      videos,
    };

    setIsSaving(true);
    try {
      const result = isEdit
        ? await updateBlogPost(post.id, post.slug, payload)
        : await createBlogPost(payload);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? "Article updated" : "Article saved");
        setTimeout(() => {
          window.location.href = "/admin/blog";
        }, 900);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white shadow-sm">
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
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    active
                      ? "border-[#0ea5e9] bg-sky-50 text-[#0ea5e9]"
                      : done
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-slate-50 text-slate-400",
                    i > step ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                  ].join(" ")}
                  aria-current={active ? "step" : undefined}
                >
                  <span
                    className={[
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                      active ? "bg-[#0ea5e9] text-white" : done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500",
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
        <div className={step === 0 ? "space-y-5" : "hidden"}>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Title (English) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => handleTitleEnChange(e.target.value)}
              placeholder="Market Daily Dose: …"
              className={fieldClass}
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
                  onClick={() => {
                    const next = slugify(titleEn);
                    if (next) {
                      setSlug(next);
                      setSlugTouched(false);
                    }
                  }}
                  className="text-xs font-semibold text-[#0ea5e9] hover:text-sky-700"
                >
                  Regenerate from title
                </button>
              ) : null}
            </div>
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              className={`${fieldClass} font-mono text-xs`}
            />
            <p className="mt-1 text-xs text-slate-400">URL: /blog/your-slug</p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Title (Khmer) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={titleKm}
              onChange={(e) => setTitleKm(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Excerpt (English)
              </label>
              <textarea
                name="excerpt_en"
                rows={3}
                defaultValue={post?.excerpt_en ?? ""}
                placeholder="Short summary for the listing page…"
                className={`${fieldClass} resize-y`}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Excerpt (Khmer)
              </label>
              <textarea
                name="excerpt_km"
                rows={3}
                defaultValue={post?.excerpt_km ?? ""}
                className={`${fieldClass} resize-y`}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Publish date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              name="published_at"
              defaultValue={toDatetimeLocalValue(post?.published_at)}
              className={fieldClass}
            />
          </div>
        </div>

        <div className={step === 1 ? "space-y-5" : "hidden"}>
          <p className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {CONTENT_HINT}
          </p>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Article (English) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="body_en"
              rows={16}
              defaultValue={post?.body_en ?? ""}
              placeholder={"## Section title\n\nParagraph text…\n\n- Bullet point"}
              className={`${fieldClass} resize-y font-mono text-xs leading-relaxed`}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Article (Khmer) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="body_km"
              rows={16}
              defaultValue={post?.body_km ?? ""}
              className={`${fieldClass} resize-y font-mono text-xs leading-relaxed`}
            />
          </div>
        </div>

        <div className={step === 2 ? "space-y-5" : "hidden"}>
          <BlogVideoEditor
            key={post?.id ?? "new"}
            initialItems={post?.videos ?? []}
            onChange={setVideos}
          />
        </div>

        <div className={step === 3 ? "space-y-5" : "hidden"}>
          <R2Uploader
            bucketName="trading-tool"
            accept="image/png,image/jpeg,image/webp"
            label={
              <>
                Featured image <span className="font-normal text-slate-400">(optional)</span>
              </>
            }
            hint="PNG, JPG, WebP — shown on list and article header"
            initialUrl={featuredUrl || undefined}
            onUploaded={(url) => setFeaturedUrl(url)}
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">Status</label>
            <div className="flex gap-3">
              {(["Draft", "Published"] as const).map((s) => (
                <label
                  key={s}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm has-[:checked]:border-[#0ea5e9] has-[:checked]:bg-sky-50"
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
              Published articles appear on the public blog at /blog.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || isSaving}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Back
          </button>
          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-lg bg-[#0ea5e9] px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-[#0ea5e9] px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 disabled:bg-slate-300"
            >
              {isSaving ? "Saving…" : isEdit ? "Save changes" : "Publish article"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
