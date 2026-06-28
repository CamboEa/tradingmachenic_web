import { unstable_cache } from "next/cache";

import { PODCASTS_CACHE_TAG } from "@/lib/cache-tags";
import { getSharedAdminClient, getSharedPublicClient } from "./shared";

export type PodcastStatus = "draft" | "published";

export interface Podcast {
  id: string;
  created_at: string;
  youtube_url: string;
  title_en: string;
  title_km: string;
  description_en: string | null;
  description_km: string | null;
  sort_order: number;
  status: PodcastStatus;
}

export async function getAllPodcasts(): Promise<Podcast[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables");
      return [];
    }

    const adminClient = getSharedAdminClient();

    const { data, error } = await adminClient
      .from("podcasts")
      .select("*")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching podcasts:", error.message);
      return [];
    }

    return (data || []) as Podcast[];
  } catch (err) {
    console.error("Exception fetching podcasts:", err);
    return [];
  }
}

const getCachedPublishedPodcasts = unstable_cache(
  async () => {
    const supabase = getSharedPublicClient();
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as Podcast[];
  },
  ["published-podcasts"],
  {
    revalidate: 60,
    tags: [PODCASTS_CACHE_TAG],
  },
);

export async function getPublishedPodcasts(): Promise<Podcast[]> {
  try {
    return await getCachedPublishedPodcasts();
  } catch (err) {
    console.error("Exception fetching published podcasts:", err);
    return [];
  }
}

const getCachedPublishedPodcastById = unstable_cache(
  async (id: string) => {
    const supabase = getSharedPublicClient();
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .single();
    if (error) throw error;
    return data as Podcast;
  },
  ["published-podcast-by-id"],
  {
    revalidate: 60,
    tags: [PODCASTS_CACHE_TAG],
  },
);

export async function getPublishedPodcastById(id: string): Promise<Podcast | null> {
  try {
    return await getCachedPublishedPodcastById(id);
  } catch {
    return null;
  }
}
