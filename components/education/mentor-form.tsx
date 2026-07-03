"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

import { R2Uploader } from "@/components/shared/r2-uploader";
import { MultiSelectDropdown } from "@/components/ui/dropdown";
import { educationCategorySlugs } from "@/lib/education/categories";
import { slugify } from "@/lib/slug";
import { createMentor, updateMentor } from "@/lib/supabase/actions";
import type { AdminMentor } from "@/lib/supabase/mentors";
import { FIELD_CLASS } from "@/lib/ui/styles";

const fieldClass = FIELD_CLASS;

const categoryLabels: Record<(typeof educationCategorySlugs)[number], string> = {
  forex: "Forex",
  stock: "Stock",
  crypto: "Crypto",
  siac: "SIAC",
};

const categoryOptions = educationCategorySlugs.map((slug) => ({
  value: slug,
  label: categoryLabels[slug],
}));

export function MentorForm({ mentor }: { mentor?: AdminMentor }) {
  const isEdit = !!mentor;
  const [isSaving, setIsSaving] = useState(false);
  const [slug, setSlug] = useState(mentor?.slug ?? "");
  const [imageUrl, setImageUrl] = useState(mentor?.imageUrl ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    mentor?.categories ?? [],
  );

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const name_en = (formData.get("name_en") as string)?.trim() ?? "";
    const name_km = (formData.get("name_km") as string)?.trim() ?? "";
    const title_en = (formData.get("title_en") as string)?.trim() ?? "";
    const title_km = (formData.get("title_km") as string)?.trim() ?? "";
    const bio_en = (formData.get("bio_en") as string)?.trim() ?? "";
    const bio_km = (formData.get("bio_km") as string)?.trim() ?? "";
    const status = formData.get("status") as string;
    const resolvedSlug = slugify(slug || name_en);

    if (!name_en || !name_km) {
      toast.error("English and Khmer names are required");
      return;
    }
    if (!resolvedSlug) {
      toast.error("Enter a valid slug or English name");
      return;
    }
    if (selectedCategories.length === 0) {
      toast.error("Select at least one market category");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        slug: resolvedSlug,
        name_en,
        name_km,
        title_en: title_en || undefined,
        title_km: title_km || undefined,
        bio_en: bio_en || undefined,
        bio_km: bio_km || undefined,
        image_url: imageUrl.trim() || undefined,
        status: (status === "Published" ? "published" : "draft") as "draft" | "published",
        categories: selectedCategories,
      };

      const result = isEdit
        ? await updateMentor(mentor.slug, payload)
        : await createMentor(payload);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? "Mentor updated" : "Mentor created");
        setTimeout(() => {
          window.location.href = "/admin/mentors";
        }, 900);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save mentor");
    } finally {
      setIsSaving(false);
    }
  };

  const defaultStatus = mentor?.status === "published" ? "Published" : "Draft";

  return (
    <div className="rounded-lg border border-bridge bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="mb-6 text-base font-bold text-foreground">Mentor profile</h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name_en" className="mb-1.5 block text-xs font-semibold text-ink-muted">
              Name (English)
            </label>
            <input
              id="name_en"
              name="name_en"
              type="text"
              required
              defaultValue={mentor?.names.en ?? ""}
              onChange={(e) => {
                if (!isEdit && !slug) {
                  setSlug(slugify(e.target.value));
                }
              }}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="name_km" className="mb-1.5 block text-xs font-semibold text-ink-muted">
              Name (Khmer)
            </label>
            <input
              id="name_km"
              name="name_km"
              type="text"
              required
              defaultValue={mentor?.names.km ?? ""}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="slug" className="mb-1.5 block text-xs font-semibold text-ink-muted">
            URL slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated-from-name"
            className={fieldClass}
          />
          <p className="mt-1 text-xs text-ink-soft">
            Used in mentor URLs, e.g. /education/forex/your-slug
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="title_en" className="mb-1.5 block text-xs font-semibold text-ink-muted">
              Title / strategy focus (English)
            </label>
            <input
              id="title_en"
              name="title_en"
              type="text"
              defaultValue={mentor?.titles.en ?? ""}
              placeholder="Forex & ICT Trading Educator"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="title_km" className="mb-1.5 block text-xs font-semibold text-ink-muted">
              Title / strategy focus (Khmer)
            </label>
            <input
              id="title_km"
              name="title_km"
              type="text"
              defaultValue={mentor?.titles.km ?? ""}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bio_en" className="mb-1.5 block text-xs font-semibold text-ink-muted">
              Bio (English)
            </label>
            <textarea
              id="bio_en"
              name="bio_en"
              rows={4}
              defaultValue={mentor?.bios.en ?? ""}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="bio_km" className="mb-1.5 block text-xs font-semibold text-ink-muted">
              Bio (Khmer)
            </label>
            <textarea
              id="bio_km"
              name="bio_km"
              rows={4}
              defaultValue={mentor?.bios.km ?? ""}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="image_url" className="mb-1.5 block text-xs font-semibold text-ink-muted">
            Profile image URL
          </label>
          <input
            id="image_url"
            name="image_url"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="/Images/mentor.png or https://..."
            className={fieldClass}
          />
          <div className="mt-3">
            <R2Uploader
              bucketName="trading-tool"
              accept="image/png,image/jpeg,image/webp"
              label="Or upload a portrait image"
              hint="PNG, JPG, or WebP. Saved to cloud storage."
              initialUrl={mentor?.imageUrl || undefined}
              onUploaded={(url) => setImageUrl(url)}
              getKeyPrefix={() => "mentors/"}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
            Market categories
          </label>
          <MultiSelectDropdown
            values={selectedCategories}
            options={categoryOptions}
            onChange={setSelectedCategories}
            placeholder="Select categories…"
            className="w-full sm:max-w-xs"
          />
          <p className="mt-1 text-xs text-ink-soft">
            Pick one or more markets this mentor teaches.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="status" className="mb-1.5 block text-xs font-semibold text-ink-muted">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={defaultStatus}
              className={fieldClass}
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
            </select>
          </div>
        </div>

        {isEdit ? (
          <div className="rounded-lg border border-bridge/30 bg-surface-soft px-4 py-3 text-sm text-ink-muted">
            After saving, use the lesson sections below to manage topics and add lessons.
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-bridge/30 pt-5">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-teal px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal/90 disabled:opacity-60"
          >
            {isSaving ? "Saving…" : isEdit ? "Save mentor" : "Create mentor"}
          </button>
          <Link
            href="/admin/mentors"
            className="rounded-lg border border-bridge/40 px-5 py-2.5 text-sm font-semibold text-ink-muted transition hover:bg-surface-soft"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
