import { createClient } from "./server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { parseBlogVideos, type BlogVideoItem } from "./blog-videos";

export type BlogStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  created_at: string;
  updated_at: string;
  slug: string;
  title_en: string;
  title_km: string;
  excerpt_en: string | null;
  excerpt_km: string | null;
  body_en: string;
  body_km: string;
  featured_image_url: string | null;
  published_at: string;
  status: BlogStatus;
  videos: BlogVideoItem[];
}

function mapBlogRow(row: Record<string, unknown>): BlogPost {
  return {
    ...(row as unknown as Omit<BlogPost, "videos">),
    videos: parseBlogVideos(row.videos),
  };
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return [];
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data, error } = await adminClient
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching blog posts:", error.message);
      return [];
    }

    return (data || []).map((row) => mapBlogRow(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) {
      console.error("Error fetching published blog posts:", error.message);
      return [];
    }

    return (data || []).map((row) => mapBlogRow(row as Record<string, unknown>));
  } catch {
    return [];
  }
}

export async function getPublishedBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) return null;
    return mapBlogRow(data as Record<string, unknown>);
  } catch {
    return null;
  }
}
