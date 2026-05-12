"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { defaultLocale } from "@/lib/i18n";

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

export async function deleteLesson(slug: string): Promise<{ error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("slug", slug);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/lessons");
  return {};
}

export async function getLessonForEdit(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching lesson:", error);
    return null;
  }

  const { data: videos } = await supabase
    .from("lesson_videos")
    .select("*")
    .eq("lesson_id", data.id)
    .order("sort_order", { ascending: true });

  return { lesson: data, videos: videos || [] };
}

export async function createLesson(formData: {
  slug: string;
  title_en: string;
  title_km: string;
  summary_en: string;
  summary_km: string;
  approximate_minutes: number;
  type: "free" | "paid";
  videos: Array<{
    embedUrl?: string;
    url?: string;
    title_en: string;
    title_km: string;
  }>;
}): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createAdminClient();

  try {
    // Create lesson
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .insert([
        {
          slug: formData.slug,
          title_en: formData.title_en,
          title_km: formData.title_km,
          summary_en: formData.summary_en,
          summary_km: formData.summary_km,
          approximate_minutes: formData.approximate_minutes,
          type: formData.type,
          status: "draft",
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
      embed_url: v.embedUrl || v.url || "",
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
    revalidatePath("/education");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create lesson" };
  }
}

export async function updateLesson(
  slug: string,
  formData: {
    title_en: string;
    title_km: string;
    summary_en: string;
    summary_km: string;
    approximate_minutes: number;
    type: "free" | "paid";
    videos: Array<{
      id?: string;
      embedUrl?: string;
      url?: string;
      title_en: string;
      title_km: string;
    }>;
  }
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createAdminClient();

  try {
    // Get lesson by slug
    const { data: lesson, error: fetchError } = await supabase
      .from("lessons")
      .select("id")
      .eq("slug", slug)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    // Update lesson
    const { error: lessonError } = await supabase
      .from("lessons")
      .update({
        title_en: formData.title_en,
        title_km: formData.title_km,
        summary_en: formData.summary_en,
        summary_km: formData.summary_km,
        approximate_minutes: formData.approximate_minutes,
        type: formData.type,
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
      embed_url: v.embedUrl || v.url || "",
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
    revalidatePath("/education");
    return { success: true };
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
  file_url: string;
  image_url?: string;
  install_guide_url?: string;
  status: "draft" | "published";
};

export async function createTool(formData: ToolFormData): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createAdminClient();

  try {
    const { error } = await supabase.from("tools").insert([{
      name: formData.name,
      type: formData.type,
      platform: formData.platform,
      pricing: formData.pricing,
      version: formData.version,
      description_en: formData.description_en ?? null,
      description_km: formData.description_km ?? null,
      file_url: formData.file_url,
      image_url: formData.image_url ?? null,
      install_guide_url: formData.install_guide_url ?? null,
      status: formData.status,
    }]);

    if (error) return { error: error.message };

    revalidatePath("/admin/tools");
    return { success: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to create tool" };
  }
}

export async function getToolForEdit(id: string) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.from("tools").select("*").eq("id", id).single();
  if (error) return null;
  return data;
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
      file_url: formData.file_url,
      image_url: formData.image_url ?? null,
      install_guide_url: formData.install_guide_url ?? null,
      status: formData.status,
    }).eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/tools");
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
  return {};
}
