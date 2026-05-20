"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CURRICULUM_CACHE_TAG, LESSONS_CACHE_TAG } from "@/lib/cache-tags";

import { defaultLocale, locales } from "@/lib/i18n";
import type { CurriculumAccent } from "@/lib/curriculum";
import type { Tool } from "@/lib/supabase/tools";
import type { Podcast } from "@/lib/supabase/podcasts";
import { slugify } from "@/lib/slug";
import { extractYouTubeVideoId, resolveLessonVideoEmbedUrl } from "@/lib/youtube";

import { createClient, createAdminClient } from "./server";

export type AuthState = { error: string } | null | undefined;

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) return { error: error.message };

  // Redirect admins straight to the dashboard
  const adminClient = await createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  revalidatePath("/", "layout");

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  const redirectTo = (formData.get("redirectTo") as string) || `/${defaultLocale}/education`;
  redirect(redirectTo);
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  // Supabase sends a confirmation email — show a success state
  return null;
}

export async function signOut(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(`/${defaultLocale}`);
}

export async function markLessonComplete(
  slug: string,
  locale: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to save progress" };
  }

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_slug: slug,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_slug" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/${locale}/education`);
  revalidatePath(`/${locale}/education/${slug}`);
  revalidatePath(`/${locale}`);
  return { success: true };
}

export async function deleteLesson(slug: string): Promise<{ error?: string }> {
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("slug", slug);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/lessons");
  revalidateTag(LESSONS_CACHE_TAG, "max");
  return {};
}

export async function getLessonForEdit(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", decodedSlug)
    .maybeSingle();

  if (error) {
    console.error(
      "Error fetching lesson:",
      error.message,
      error.code,
      error.details,
    );
    return null;
  }

  if (!data) {
    return null;
  }

  const { data: videos, error: videosError } = await supabase
    .from("lesson_videos")
    .select("*")
    .eq("lesson_id", data.id)
    .order("sort_order", { ascending: true });

  if (videosError) {
    console.error(
      "Error fetching lesson videos:",
      videosError.message,
      videosError.code,
    );
    return null;
  }

  return { lesson: data, videos: videos || [] };
}

export async function createLesson(formData: {
  slug: string;
  title_en: string;
  title_km: string;
  summary_en: string;
  summary_km: string;
  approximate_minutes: number;
  objectives_en: string[];
  objectives_km: string[];
  type: "free" | "paid";
  status: "draft" | "published";
  thumbnail_url?: string | null;
  videos: Array<{
    embedUrl?: string;
    url?: string;
    title_en: string;
    title_km: string;
  }>;
}): Promise<{ error?: string; success?: boolean; slug?: string }> {
  const supabase = await createAdminClient();
  const slug = slugify(formData.slug);
  if (!slug) {
    return { error: "Slug is required (add an English title or enter a slug)." };
  }

  try {
    // Create lesson
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .insert([
        {
          slug,
          title_en: formData.title_en,
          title_km: formData.title_km,
          summary_en: formData.summary_en,
          summary_km: formData.summary_km,
          approximate_minutes: formData.approximate_minutes,
          objectives_en: formData.objectives_en,
          objectives_km: formData.objectives_km,
          type: formData.type,
          status: formData.status,
          thumbnail_url: formData.thumbnail_url?.trim() || null,
        },
      ])
      .select()
      .single();

    if (lessonError) {
      return { error: lessonError.message };
    }

    // Create videos
    const videosToInsert = formData.videos.map((v, idx) => ({
      lesson_id: lesson.id,
      embed_url: resolveLessonVideoEmbedUrl(v.embedUrl || v.url || ""),
      title_en: v.title_en,
      title_km: v.title_km,
      sort_order: idx,
    }));

    const { error: videosError } = await supabase
      .from("lesson_videos")
      .insert(videosToInsert);

    if (videosError) {
      return { error: videosError.message };
    }

    revalidatePath("/admin/lessons");
    revalidateTag(LESSONS_CACHE_TAG, "max");
    for (const loc of locales) {
      revalidatePath(`/${loc}/education`);
      revalidatePath(`/${loc}/education/${slug}`);
    }
    return { success: true, slug };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create lesson" };
  }
}

export async function updateLesson(
  originalSlug: string,
  formData: {
    slug: string;
    title_en: string;
    title_km: string;
    summary_en: string;
    summary_km: string;
    approximate_minutes: number;
    objectives_en: string[];
    objectives_km: string[];
    type: "free" | "paid";
    status: "draft" | "published";
    thumbnail_url?: string | null;
    videos: Array<{
      id?: string;
      embedUrl?: string;
      url?: string;
      title_en: string;
      title_km: string;
    }>;
  }
): Promise<{ error?: string; success?: boolean; slug?: string }> {
  const supabase = await createAdminClient();
  const decodedOriginal = decodeURIComponent(originalSlug);
  const newSlug = slugify(formData.slug);
  if (!newSlug) {
    return { error: "Slug is required (add an English title or enter a slug)." };
  }

  try {
    // Get lesson by slug
    const { data: lesson, error: fetchError } = await supabase
      .from("lessons")
      .select("id")
      .eq("slug", decodedOriginal)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    // Update lesson
    const { error: lessonError } = await supabase
      .from("lessons")
      .update({
        slug: newSlug,
        title_en: formData.title_en,
        title_km: formData.title_km,
        summary_en: formData.summary_en,
        summary_km: formData.summary_km,
        approximate_minutes: formData.approximate_minutes,
        objectives_en: formData.objectives_en,
        objectives_km: formData.objectives_km,
        type: formData.type,
        status: formData.status,
        thumbnail_url: formData.thumbnail_url?.trim() || null,
      })
      .eq("id", lesson.id);

    if (lessonError) {
      return { error: lessonError.message };
    }

    // Delete existing videos
    await supabase.from("lesson_videos").delete().eq("lesson_id", lesson.id);

    // Insert new videos
    const videosToInsert = formData.videos.map((v, idx) => ({
      lesson_id: lesson.id,
      embed_url: resolveLessonVideoEmbedUrl(v.embedUrl || v.url || ""),
      title_en: v.title_en,
      title_km: v.title_km,
      sort_order: idx,
    }));

    const { error: videosError } = await supabase
      .from("lesson_videos")
      .insert(videosToInsert);

    if (videosError) {
      return { error: videosError.message };
    }

    revalidatePath("/admin/lessons");
    revalidateTag(LESSONS_CACHE_TAG, "max");
    for (const loc of locales) {
      revalidatePath(`/${loc}/education`);
      revalidatePath(`/${loc}/education/${decodedOriginal}`);
      revalidatePath(`/${loc}/education/${newSlug}`);
    }
    return { success: true, slug: newSlug };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update lesson" };
  }
}

type ToolFormData = {
  name: string;
  type: "indicator" | "ea";
  platform: "MT4" | "MT5" | "MT4 & MT5";
  pricing: "free" | "paid";
  version: string;
  description_en?: string;
  description_km?: string;
  requirements_en?: string;
  requirements_km?: string;
  how_it_works_en?: string;
  how_it_works_km?: string;
  key_features_en?: string;
  key_features_km?: string;
  usage_notes_en?: string;
  usage_notes_km?: string;
  file_url: string;
  image_url?: string;
  install_guide_url?: string;
  status: "draft" | "published";
};

function revalidateToolPaths(toolId?: string) {
  for (const loc of locales) {
    revalidatePath(`/${loc}/tools`);
    if (toolId) revalidatePath(`/${loc}/tools/${toolId}`);
  }
}

export async function createTool(formData: ToolFormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createAdminClient();

  try {
    const row = {
      name: formData.name,
      type: formData.type,
      platform: formData.platform,
      pricing: formData.pricing,
      version: formData.version,
      description_en: formData.description_en ?? null,
      description_km: formData.description_km ?? null,
      requirements_en: formData.requirements_en ?? null,
      requirements_km: formData.requirements_km ?? null,
      how_it_works_en: formData.how_it_works_en ?? null,
      how_it_works_km: formData.how_it_works_km ?? null,
      key_features_en: formData.key_features_en ?? null,
      key_features_km: formData.key_features_km ?? null,
      usage_notes_en: formData.usage_notes_en ?? null,
      usage_notes_km: formData.usage_notes_km ?? null,
      file_url: formData.file_url,
      image_url: formData.image_url ?? null,
      install_guide_url: formData.install_guide_url ?? null,
      status: formData.status,
    };

    const { data, error } = await supabase.from("tools").insert([row]).select("id").single();

    if (error) return { error: error.message };

    revalidatePath("/admin/tools");
    revalidateToolPaths(data?.id);

    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create tool" };
  }
}

export async function getToolForEdit(id: string): Promise<Tool | null> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from("tools").select("*").eq("id", id).single();
  if (error) return null;
  return data as Tool;
}

export async function updateTool(id: string, formData: ToolFormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createAdminClient();

  try {
    const { error } = await supabase.from("tools").update({
      name: formData.name,
      type: formData.type,
      platform: formData.platform,
      pricing: formData.pricing,
      version: formData.version,
      description_en: formData.description_en ?? null,
      description_km: formData.description_km ?? null,
      requirements_en: formData.requirements_en ?? null,
      requirements_km: formData.requirements_km ?? null,
      how_it_works_en: formData.how_it_works_en ?? null,
      how_it_works_km: formData.how_it_works_km ?? null,
      key_features_en: formData.key_features_en ?? null,
      key_features_km: formData.key_features_km ?? null,
      usage_notes_en: formData.usage_notes_en ?? null,
      usage_notes_km: formData.usage_notes_km ?? null,
      file_url: formData.file_url,
      image_url: formData.image_url ?? null,
      install_guide_url: formData.install_guide_url ?? null,
      status: formData.status,
    }).eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/tools");
    revalidateToolPaths(id);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update tool" };
  }
}

export async function deleteTool(id: string): Promise<{ error?: string }> {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("tools").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/tools");
  revalidateToolPaths();
  return {};
}

type PodcastFormData = {
  youtube_url: string;
  title_en: string;
  title_km: string;
  description_en?: string;
  description_km?: string;
  sort_order: number;
  status: "draft" | "published";
};

function revalidatePodcastPaths(podcastId?: string) {
  for (const loc of locales) {
    revalidatePath(`/${loc}/podcast`);
    if (podcastId) revalidatePath(`/${loc}/podcast/${podcastId}`);
  }
}

export async function getPodcastForEdit(id: string): Promise<Podcast | null> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from("podcasts").select("*").eq("id", id).single();
  if (error) return null;
  return data as Podcast;
}

export async function createPodcast(
  formData: PodcastFormData,
): Promise<{ error?: string; success?: boolean }> {
  if (!extractYouTubeVideoId(formData.youtube_url)) {
    return { error: "Enter a valid YouTube link or 11-character video ID." };
  }
  const supabase = await createAdminClient();
  try {
    const row = {
      youtube_url: formData.youtube_url.trim(),
      title_en: formData.title_en.trim(),
      title_km: formData.title_km.trim(),
      description_en: formData.description_en?.trim() || null,
      description_km: formData.description_km?.trim() || null,
      sort_order: formData.sort_order,
      status: formData.status,
    };
    const { data, error } = await supabase.from("podcasts").insert([row]).select("id").single();
    if (error) return { error: error.message };
    revalidatePath("/admin/podcasts");
    revalidatePodcastPaths(data?.id);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create episode" };
  }
}

export async function updatePodcast(
  id: string,
  formData: PodcastFormData,
): Promise<{ error?: string; success?: boolean }> {
  if (!extractYouTubeVideoId(formData.youtube_url)) {
    return { error: "Enter a valid YouTube link or 11-character video ID." };
  }
  const supabase = await createAdminClient();
  try {
    const { error } = await supabase
      .from("podcasts")
      .update({
        youtube_url: formData.youtube_url.trim(),
        title_en: formData.title_en.trim(),
        title_km: formData.title_km.trim(),
        description_en: formData.description_en?.trim() || null,
        description_km: formData.description_km?.trim() || null,
        sort_order: formData.sort_order,
        status: formData.status,
      })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidatePath("/admin/podcasts");
    revalidatePodcastPaths(id);
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update episode" };
  }
}

export async function deletePodcast(id: string): Promise<{ error?: string }> {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("podcasts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/podcasts");
  revalidatePodcastPaths(id);
  return {};
}

function revalidateCurriculumPaths() {
  revalidateTag(CURRICULUM_CACHE_TAG, "max");
  for (const loc of locales) {
    revalidatePath(`/${loc}/curriculum`);
  }
  revalidatePath("/admin/program");
  revalidatePath("/admin");
}

export async function createCurriculumPhase(data: {
  slug: string;
  accent: CurriculumAccent;
  sort_order: number;
  label_en: string;
  label_km: string;
  sublabel_en: string;
  sublabel_km: string;
}): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createAdminClient();
  const slug = data.slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  if (!slug) return { error: "Slug is required (letters, numbers, hyphens only)." };
  try {
    const { error } = await supabase.from("curriculum_phases").insert({
      slug,
      accent: data.accent,
      sort_order: data.sort_order,
      label_en: data.label_en.trim(),
      label_km: data.label_km.trim(),
      sublabel_en: data.sublabel_en.trim(),
      sublabel_km: data.sublabel_km.trim(),
    });
    if (error) return { error: error.message };
    revalidateCurriculumPaths();
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create phase" };
  }
}

export async function updateCurriculumPhase(
  id: string,
  data: {
    slug: string;
    accent: CurriculumAccent;
    sort_order: number;
    label_en: string;
    label_km: string;
    sublabel_en: string;
    sublabel_km: string;
  },
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createAdminClient();
  const slug = data.slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  if (!slug) return { error: "Slug is required." };
  try {
    const { error } = await supabase
      .from("curriculum_phases")
      .update({
        slug,
        accent: data.accent,
        sort_order: data.sort_order,
        label_en: data.label_en.trim(),
        label_km: data.label_km.trim(),
        sublabel_en: data.sublabel_en.trim(),
        sublabel_km: data.sublabel_km.trim(),
      })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidateCurriculumPaths();
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update phase" };
  }
}

export async function deleteCurriculumPhase(id: string): Promise<{ error?: string }> {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("curriculum_phases").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateCurriculumPaths();
  return {};
}

export async function createCurriculumModule(data: {
  phase_id: string;
  sort_order?: number;
  title_en: string;
  title_km: string;
  focus_en: string;
  focus_km: string;
  activities_en: string;
  activities_km: string;
}): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createAdminClient();
  try {
    let sortOrder = data.sort_order;
    if (sortOrder == null) {
      const { data: last } = await supabase
        .from("curriculum_modules")
        .select("sort_order")
        .eq("phase_id", data.phase_id)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      sortOrder = (last?.sort_order ?? -1) + 1;
    }
    const { error } = await supabase.from("curriculum_modules").insert({
      phase_id: data.phase_id,
      sort_order: sortOrder,
      title_en: data.title_en.trim(),
      title_km: data.title_km.trim(),
      focus_en: data.focus_en.trim(),
      focus_km: data.focus_km.trim(),
      activities_en: data.activities_en.trimEnd(),
      activities_km: data.activities_km.trimEnd(),
    });
    if (error) return { error: error.message };
    revalidateCurriculumPaths();
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create module" };
  }
}

export async function updateCurriculumModule(
  id: string,
  data: {
    sort_order: number;
    title_en: string;
    title_km: string;
    focus_en: string;
    focus_km: string;
    activities_en: string;
    activities_km: string;
  },
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createAdminClient();
  try {
    const { error } = await supabase
      .from("curriculum_modules")
      .update({
        sort_order: data.sort_order,
        title_en: data.title_en.trim(),
        title_km: data.title_km.trim(),
        focus_en: data.focus_en.trim(),
        focus_km: data.focus_km.trim(),
        activities_en: data.activities_en.trimEnd(),
        activities_km: data.activities_km.trimEnd(),
      })
      .eq("id", id);
    if (error) return { error: error.message };
    revalidateCurriculumPaths();
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to update module" };
  }
}

export async function deleteCurriculumModule(id: string): Promise<{ error?: string }> {
  const supabase = await createAdminClient();
  const { error } = await supabase.from("curriculum_modules").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateCurriculumPaths();
  return {};
}
