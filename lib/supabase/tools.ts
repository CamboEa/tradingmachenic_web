import { createClient } from "./server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { parseToolGallery, type ToolGalleryItem } from "./tool-gallery";

export type { ToolGalleryItem };

export interface Tool {
  id: string;
  created_at: string;
  name: string;
  type: "indicator" | "ea";
  platform: "MT4" | "MT5" | "MT4 & MT5";
  pricing: "free" | "paid";
  version: string;
  description_en: string | null;
  description_km: string | null;
  requirements_en: string | null;
  requirements_km: string | null;
  how_it_works_en: string | null;
  how_it_works_km: string | null;
  key_features_en: string | null;
  key_features_km: string | null;
  usage_notes_en: string | null;
  usage_notes_km: string | null;
  proof_of_testing_en: string | null;
  proof_of_testing_km: string | null;
  gallery: ToolGalleryItem[];
  install_guide_url: string | null;
  file_url: string | null;
  file_url_mt4: string | null;
  file_url_mt5: string | null;
  image_url: string | null;
  download_count: number;
  download_count_mt4: number;
  download_count_mt5: number;
  status: "draft" | "published";
}

function normalizeToolRow(row: Record<string, unknown>): Tool {
  const base = row as unknown as Tool;
  return {
    ...base,
    gallery: parseToolGallery(row.gallery ?? base.gallery),
  };
}

export async function getAllTools() {
  try {
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables");
      return [];
    }

    // Use service role for admin access (bypasses RLS)
    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await adminClient
      .from("tools")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching tools:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return [];
    }

    return (data || []).map((row) => normalizeToolRow(row as Record<string, unknown>));
  } catch (err) {
    console.error("Exception fetching tools:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function getPublishedToolById(id: string): Promise<Tool | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tools")
      .select("*")
      .eq("id", id)
      .eq("status", "published")
      .single();
    if (error) return null;
    return normalizeToolRow(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function getPublishedTools() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("tools")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching published tools:", {
        message: error.message,
        code: error.code,
        details: error.details,
      });
      return [];
    }

    return (data || []).map((row) => normalizeToolRow(row as Record<string, unknown>));
  } catch (err) {
    console.error("Exception fetching published tools:", err);
    return [];
  }
}
