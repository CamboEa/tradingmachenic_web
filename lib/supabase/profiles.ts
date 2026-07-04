import { createAdminClient } from "./server";
import { getSharedAdminClient } from "./shared";

export type UserRole = "student" | "admin" | "mentor";

export interface Profile {
  id: string;
  created_at: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  mentor_id: string | null;
}

/** List every registered user. Uses the service role to bypass RLS (admin-only pages). */
export async function getAllProfiles(): Promise<Profile[]> {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching profiles:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return [];
    }

    return (data ?? []) as Profile[];
  } catch (err) {
    console.error("Exception fetching profiles:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function getProfileByMentorId(mentorId: string): Promise<Profile | null> {
  try {
    const supabase = getSharedAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("mentor_id", mentorId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching mentor account profile:", error.message);
      return null;
    }
    if (!data) return null;
    return data as Profile;
  } catch {
    return null;
  }
}

/** Map mentor_id -> linked login profile for all mentor accounts. */
export async function getMentorAccountProfilesByMentorId(): Promise<Map<string, Profile>> {
  try {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "mentor")
      .not("mentor_id", "is", null);

    if (error || !data) return new Map();

    const map = new Map<string, Profile>();
    for (const row of data) {
      const profile = row as Profile;
      if (profile.mentor_id) {
        map.set(profile.mentor_id, profile);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}
