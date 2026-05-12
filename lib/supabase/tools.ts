import { createClient } from "./server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

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
  install_guide_url: string | null;
  file_url: string | null;
  image_url: string | null;
  status: "draft" | "published";
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

    return (data || []) as Tool[];
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
    return data as Tool;
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

    return (data || []) as Tool[];
  } catch (err) {
    console.error("Exception fetching published tools:", err);
    return [];
  }
}
