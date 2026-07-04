import { getSessionUser, createAdminClient } from "@/lib/supabase/server";

export type StaffAccess =
  | { role: "admin"; userId: string }
  | { role: "mentor"; userId: string; mentorId: string; mentorSlug: string };

export function isAdminAccess(access: StaffAccess): access is StaffAccess & { role: "admin" } {
  return access.role === "admin";
}

export function mentorScopeError(access: StaffAccess, mentorSlug: string): string | null {
  if (access.role === "admin") return null;
  const normalized = mentorSlug.trim();
  if (!normalized || access.mentorSlug !== normalized) {
    return "You can only manage your own mentor content.";
  }
  return null;
}

export function toolScopeError(
  access: StaffAccess,
  tool: { mentor_slug?: string | null },
): string | null {
  if (access.role === "admin") return null;
  if (!tool.mentor_slug || tool.mentor_slug !== access.mentorSlug) {
    return "You can only manage your own tools.";
  }
  return null;
}

export async function getStaffAccess(): Promise<StaffAccess | null> {
  const user = await getSessionUser();
  if (!user) return null;

  const supabase = await createAdminClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, mentor_id")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;

  if (profile.role === "admin") {
    return { role: "admin", userId: user.id };
  }

  if (profile.role === "mentor" && profile.mentor_id) {
    const { data: mentor } = await supabase
      .from("mentors")
      .select("slug")
      .eq("id", profile.mentor_id)
      .maybeSingle();

    if (mentor?.slug) {
      return {
        role: "mentor",
        userId: user.id,
        mentorId: profile.mentor_id,
        mentorSlug: mentor.slug,
      };
    }
  }

  return null;
}

export async function requireAdminAccess(): Promise<{ error?: string }> {
  const access = await getStaffAccess();
  if (!access) return { error: "Not authorized." };
  if (access.role !== "admin") return { error: "Admin access required." };
  return {};
}
