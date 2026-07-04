"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";

import { MentorAccountFields } from "@/components/education/mentor-account-fields";
import { R2Uploader } from "@/components/shared/r2-uploader";
import { MultiSelectDropdown } from "@/components/ui/dropdown";
import { educationCategorySlugs } from "@/lib/education/categories";
import { slugify } from "@/lib/slug";
import { createMentor, createMentorAccount, updateMentor } from "@/lib/supabase/actions";
import type { AdminMentor } from "@/lib/supabase/mentors";
import { Card } from "@/components/ui";
import { cn } from "@/lib/ui/cn";
import { FIELD_CLASS, ui } from "@/lib/ui/styles";

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

export function MentorForm({
  mentor,
  isMentorSelf = false,
}: {
  mentor?: AdminMentor;
  isMentorSelf?: boolean;
}) {
  const isEdit = !!mentor;
  const [isSaving, setIsSaving] = useState(false);
  const [slug, setSlug] = useState(mentor?.slug ?? "");
  const [imageUrl, setImageUrl] = useState(mentor?.imageUrl ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    mentor?.categories ?? [],
  );
  const [createAccount, setCreateAccount] = useState(false);
  const [mentorNameEn, setMentorNameEn] = useState(mentor?.names.en ?? "");

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

    if (!isEdit && createAccount) {
      const accountEmail = ((formData.get("email") as string) ?? "").trim();
      const accountPassword = (formData.get("password") as string) ?? "";
      if (!accountEmail) {
        toast.error("Email is required when creating a login account");
        return;
      }
      if (!accountPassword || accountPassword.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
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
        let accountWarning: string | null = null;

        if (!isEdit && createAccount && result.slug) {
          const accountEmail = ((formData.get("email") as string) ?? "").trim();
          const accountPassword = (formData.get("password") as string) ?? "";
          const accountName = ((formData.get("full_name") as string) ?? "").trim();

          if (!accountEmail || !accountPassword) {
            accountWarning = "Mentor created, but email and password are required for login access.";
          } else {
            const accountForm = new FormData();
            accountForm.set("mentor_slug", result.slug);
            accountForm.set("email", accountEmail);
            accountForm.set("password", accountPassword);
            if (accountName) accountForm.set("full_name", accountName);

            const accountResult = await createMentorAccount(accountForm);
            if (accountResult.error) {
              accountWarning = `Mentor created, but login setup failed: ${accountResult.error}`;
            }
          }
        }

        if (accountWarning) {
          toast.warn(accountWarning);
        } else if (!isEdit && createAccount) {
          toast.success("Mentor and login account created");
        } else {
          toast.success(isEdit ? "Mentor updated" : "Mentor created");
        }

        setTimeout(() => {
          if (isMentorSelf && result.slug) {
            window.location.href = `/admin/mentors/edit/${result.slug}`;
            return;
          }
          const editBase = `/admin/mentors/edit/${result.slug ?? mentor?.slug}`;
          const accountTab = !isEdit && createAccount ? "?tab=account" : "";
          window.location.href = isEdit
            ? editBase
            : result.slug
              ? `${editBase}${accountTab}`
              : "/admin/mentors";
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
    <Card>
      <p className={ui.eyebrowAdmin}>Profile</p>
      <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground sm:text-xl">
        Mentor profile
      </h2>
      <p className={cn(ui.pageDesc, "mt-1 mb-6")}>
        {isEdit
          ? "Update mentor details, market categories, and publish status."
          : "Create the mentor profile and optionally set up their login in one step."}
      </p>

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
                setMentorNameEn(e.target.value);
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
            readOnly={isMentorSelf}
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

        {!isMentorSelf ? (
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
        ) : (
          <input type="hidden" name="status" value={defaultStatus} />
        )}

        {isEdit ? (
          <div className="rounded-lg border border-bridge/30 bg-surface-soft px-4 py-3 text-sm text-ink-muted">
            After saving, use the lesson sections below to manage topics and add lessons.
          </div>
        ) : null}

        {!isEdit && !isMentorSelf ? (
          <div className="space-y-4 rounded-lg border border-bridge/30 bg-surface-soft/50 px-4 py-5">
            <div className="flex items-start gap-3">
              <input
                id="create_account"
                type="checkbox"
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-bridge/50 text-teal focus:ring-teal/30"
              />
              <div>
                <label htmlFor="create_account" className="text-sm font-semibold text-foreground">
                  Create login account for this mentor
                </label>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Gives them access to manage their own profile, lessons, and tools.
                </p>
              </div>
            </div>
            {createAccount ? (
              <MentorAccountFields mentorName={mentorNameEn.trim() || undefined} required />
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3 border-t border-bridge/30 pt-5">
          <button
            type="submit"
            disabled={isSaving}
            className={ui.btnPrimary}
          >
            {isSaving
              ? "Saving…"
              : isEdit
                ? "Save mentor"
                : createAccount
                  ? "Create mentor & account"
                  : "Create mentor"}
          </button>
          <Link
            href={isMentorSelf ? `/admin/mentors/edit/${mentor?.slug}` : "/admin/mentors"}
            className={ui.btnSecondary}
          >
            Cancel
          </Link>
        </div>
      </form>
    </Card>
  );
}
