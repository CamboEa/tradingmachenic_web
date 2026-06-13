import { createAdminClient } from "./server";

export type UserRole = "student" | "admin";

export interface Profile {
  id: string;
  created_at: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
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
