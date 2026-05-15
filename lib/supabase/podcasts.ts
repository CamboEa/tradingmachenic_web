import { createClient } from "./server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

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

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

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

export async function getPublishedPodcasts(): Promise<Podcast[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching published podcasts:", error.message);
      return [];
    }

    return (data || []) as Podcast[];
  } catch (err) {
    console.error("Exception fetching published podcasts:", err);
    return [];
  }
}

export async function getPublishedPodcastById(id: string): Promise<Podcast | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .single();
    if (error) return null;
    return data as Podcast;
  } catch {
    return null;
  }
}
