import { getSharedAdminClient, getSharedPublicClient } from "./shared";

import type { Locale } from "@/lib/i18n";

export type LessonTopic = {
  id: string;
  mentorSlug: string;
  slug: string;
  names: Record<Locale, string>;
  descriptions: Record<Locale, string>;
  sortOrder: number;
  imageUrl: string | null;
};

type LessonTopicRow = {
  id: string;
  mentor_slug: string;
  slug: string;
  name_en: string;
  name_km: string;
  description_en: string | null;
  description_km: string | null;
  sort_order: number;
  image_url: string | null;
};

const supabase = getSharedPublicClient();

function adminSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return getSharedAdminClient();
}

function transformTopicRow(row: LessonTopicRow): LessonTopic {
  return {
    id: row.id,
    mentorSlug: row.mentor_slug,
    slug: row.slug,
    names: { en: row.name_en, km: row.name_km },
    descriptions: {
      en: row.description_en ?? "",
      km: row.description_km ?? "",
    },
    sortOrder: row.sort_order,
    imageUrl: row.image_url ?? null,
  };
}

export async function getAllLessonTopicsForAdmin(): Promise<LessonTopic[]> {
  const supabase = adminSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("lesson_topics")
    .select("*")
    .order("mentor_slug", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching lesson topics:", error.message);
    return [];
  }

  return (data as LessonTopicRow[]).map(transformTopicRow);
}

export async function getLessonTopicsByMentor(mentorSlug: string): Promise<LessonTopic[]> {
  const { data, error } = await supabase
    .from("lesson_topics")
    .select("*")
    .eq("mentor_slug", mentorSlug)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching lesson topics for mentor:", error.message);
    return [];
  }

  return (data as LessonTopicRow[]).map(transformTopicRow);
}

export async function getLessonTopicByMentorAndSlug(
  mentorSlug: string,
  topicSlug: string,
): Promise<LessonTopic | null> {
  const { data, error } = await supabase
    .from("lesson_topics")
    .select("*")
    .eq("mentor_slug", mentorSlug)
    .eq("slug", topicSlug)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return transformTopicRow(data as LessonTopicRow);
}

export async function getLessonTopicsByMentorForAdmin(
  mentorSlug: string,
): Promise<LessonTopic[]> {
  const admin = adminSupabase();
  if (!admin) return getLessonTopicsByMentor(mentorSlug);

  const { data, error } = await admin
    .from("lesson_topics")
    .select("*")
    .eq("mentor_slug", mentorSlug)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching lesson topics for mentor:", error.message);
    return [];
  }

  return (data as LessonTopicRow[]).map(transformTopicRow);
}

export async function getLessonTopicForEdit(id: string): Promise<LessonTopic | null> {
  const supabase = adminSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("lesson_topics")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return transformTopicRow(data as LessonTopicRow);
}

export function topicsForMentor(topics: LessonTopic[], mentorSlug: string): LessonTopic[] {
  return topics.filter((topic) => topic.mentorSlug === mentorSlug);
}

export function findTopicBySlug(
  topics: LessonTopic[],
  mentorSlug: string,
  slug: string,
): LessonTopic | undefined {
  return topics.find((topic) => topic.mentorSlug === mentorSlug && topic.slug === slug);
}
