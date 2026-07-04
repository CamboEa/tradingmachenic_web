import type { EducationCategory } from "@/lib/education/categories";

export const mentorDetailSections = [
  { id: "mentor-profile", label: "Profile" },
  { id: "mentor-lessons", label: "Lessons" },
  { id: "mentor-account", label: "Login access", adminOnly: true },
] as const;

export type MentorDetailSectionId = (typeof mentorDetailSections)[number]["id"];

export function mentorDetailSectionsForUser(isAdmin: boolean) {
  return mentorDetailSections.filter(
    (section) => !("adminOnly" in section && section.adminOnly) || isAdmin,
  );
}

export function parseMentorDetailTab(tab?: string | null): MentorDetailSectionId {
  if (tab === "lessons") return "mentor-lessons";
  if (tab === "account") return "mentor-account";
  return "mentor-profile";
}

export const categoryLabels: Record<EducationCategory, string> = {
  forex: "Forex",
  stock: "Stock",
  crypto: "Crypto",
  siac: "SIAC",
};
