import { unstable_cache } from "next/cache";

import type { EducationCategory } from "@/lib/education-categories";
import { MENTORS_CACHE_TAG } from "@/lib/cache-tags";
import type { Mentor } from "@/lib/mentors";
import { getSharedAdminClient, getSharedPublicClient } from "./shared";

export type AdminMentor = Mentor & {
  id: string;
  sortOrder: number;
  status: "draft" | "published";
};

const supabase = getSharedPublicClient();

function adminSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return getSharedAdminClient();
}

type MentorCategoryRow = {
  category: string;
};

type MentorRow = {
  id: string;
  slug: string;
  name_en: string;
  name_km: string;
  title_en: string | null;
  title_km: string | null;
  bio_en: string | null;
  bio_km: string | null;
  image_url: string | null;
  sort_order: number;
  status: string;
  mentor_categories: MentorCategoryRow[] | null;
};

const MENTOR_WITH_CATEGORIES_SELECT =
  "id, slug, name_en, name_km, title_en, title_km, bio_en, bio_km, image_url, sort_order, status, mentor_categories(category)";

function toCacheable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function transformMentorRow(row: MentorRow): Mentor {
  const categories = (row.mentor_categories ?? [])
    .map((entry) => entry.category)
    .filter((value): value is EducationCategory =>
      ["forex", "stock", "crypto", "siac"].includes(value),
    );

  return {
    slug: row.slug,
    names: { en: row.name_en, km: row.name_km },
    titles: { en: row.title_en ?? "", km: row.title_km ?? "" },
    bios: { en: row.bio_en ?? "", km: row.bio_km ?? "" },
    imageUrl: row.image_url ?? "",
    categories,
  };
}

function sortMentors(mentors: MentorRow[]): Mentor[] {
  return [...mentors]
    .sort((a, b) => a.sort_order - b.sort_order || a.slug.localeCompare(b.slug))
    .map(transformMentorRow);
}

function transformAdminMentorRow(row: MentorRow): AdminMentor {
  return {
    ...transformMentorRow(row),
    id: row.id,
    sortOrder: row.sort_order,
    status: row.status === "published" ? "published" : "draft",
  };
}

async function fetchPublishedMentors(): Promise<Mentor[]> {
  const { data, error } = await supabase
    .from("mentors")
    .select(MENTOR_WITH_CATEGORIES_SELECT)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("slug", { ascending: true });

  if (error) {
    console.error("Error fetching mentors:", error);
    return [];
  }

  return sortMentors((data ?? []) as MentorRow[]);
}

async function fetchAdminMentors(): Promise<AdminMentor[]> {
  const client = adminSupabase();
  if (!client) {
    console.error("Missing Supabase admin credentials for mentors");
    return [];
  }

  const { data, error } = await client
    .from("mentors")
    .select(MENTOR_WITH_CATEGORIES_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching admin mentors:", error);
    return [];
  }

  return (data ?? []).map((row) => transformAdminMentorRow(row as MentorRow));
}

const getCachedPublishedMentors = unstable_cache(
  async () => toCacheable(await fetchPublishedMentors()),
  ["published-mentors"],
  {
    revalidate: 60,
    tags: [MENTORS_CACHE_TAG],
  },
);

export async function getAllMentors(): Promise<Mentor[]> {
  return getCachedPublishedMentors();
}

export async function getAllMentorsForAdmin(): Promise<AdminMentor[]> {
  return fetchAdminMentors();
}

export async function getMentorForAdminBySlug(slug: string): Promise<AdminMentor | null> {
  const client = adminSupabase();
  if (!client) {
    console.error("Missing Supabase admin credentials for mentors");
    return null;
  }

  const decoded = decodeURIComponent(slug);
  const { data, error } = await client
    .from("mentors")
    .select(MENTOR_WITH_CATEGORIES_SELECT)
    .eq("slug", decoded)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("Error fetching mentor for admin:", error);
    return null;
  }

  return transformAdminMentorRow(data as MentorRow);
}

export async function getMentorBySlug(slug: string): Promise<Mentor | null> {
  const mentors = await getAllMentors();
  return mentors.find((mentor) => mentor.slug === slug) ?? null;
}

export async function getMentorsByCategory(
  category: EducationCategory,
): Promise<Mentor[]> {
  const mentors = await getAllMentors();
  return mentors.filter((mentor) => mentor.categories.includes(category));
}
