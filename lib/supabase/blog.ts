import { unstable_cache } from "next/cache";

import { BLOG_CACHE_TAG } from "@/lib/cache-tags";
import { getSharedAdminClient, getSharedPublicClient } from "./shared";
import type { Locale } from "@/lib/i18n";
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

export function blogHasKhmerTranslation(post: Pick<BlogPost, "title_km" | "body_km">): boolean {
  return post.title_km.trim().length > 0 && post.body_km.trim().length > 0;
}

export function blogLocalizedTitle(post: BlogPost, locale: Locale): string {
  if (locale === "km") {
    const km = post.title_km.trim();
    if (km) return km;
  }
  return post.title_en;
}

export function blogLocalizedExcerpt(post: BlogPost, locale: Locale): string | null {
  if (locale === "km") {
    const km = post.excerpt_km?.trim();
    if (km) return km;
    return post.excerpt_en?.trim() || null;
  }
  return post.excerpt_en?.trim() || null;
}

export function blogLocalizedBody(post: BlogPost, locale: Locale): string {
  if (locale === "km") {
    const km = post.body_km.trim();
    if (km) return km;
  }
  return post.body_en;
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

    const adminClient = getSharedAdminClient();

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

const getCachedPublishedBlogPosts = unstable_cache(
  async () => {
    const supabase = getSharedPublicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((row) => mapBlogRow(row as Record<string, unknown>));
  },
  ["published-blog-posts"],
  {
    revalidate: 60,
    tags: [BLOG_CACHE_TAG],
  },
);

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  try {
    return await getCachedPublishedBlogPosts();
  } catch {
    return [];
  }
}

const getCachedPublishedBlogBySlug = unstable_cache(
  async (slug: string) => {
    const supabase = getSharedPublicClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) throw error;
    return mapBlogRow(data as Record<string, unknown>);
  },
  ["published-blog-by-slug"],
  {
    revalidate: 60,
    tags: [BLOG_CACHE_TAG],
  },
);

export async function getPublishedBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    return await getCachedPublishedBlogBySlug(slug);
  } catch {
    return null;
  }
}
