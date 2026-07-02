import { unstable_cache } from "next/cache";
import { CURRICULUM_CACHE_TAG } from "@/lib/cache-tags";
import type { CurriculumPhaseWithWeeks } from "@/lib/curriculum/curriculum";

import { getSharedAdminClient, getSharedPublicClient } from "./shared";

const supabase = getSharedPublicClient();

async function fetchCurriculum(): Promise<CurriculumPhaseWithWeeks[]> {
  const { data: phases, error: pErr } = await supabase
    .from("curriculum_phases")
    .select("*")
    .order("sort_order", { ascending: true });
  if (pErr || !phases?.length) return [];

  const { data: modules, error: mErr } = await supabase
    .from("curriculum_modules")
    .select("*")
    .order("sort_order", { ascending: true });
  if (mErr || !modules) return [];

  const byPhase = new Map<string, typeof modules>();
  for (const m of modules) {
    const list = byPhase.get(m.phase_id) ?? [];
    list.push(m);
    byPhase.set(m.phase_id, list);
  }

  return phases.map((p) => ({
    id: p.id,
    slug: p.slug,
    accent: p.accent,
    sort_order: p.sort_order,
    label_en: p.label_en,
    label_km: p.label_km,
    sublabel_en: p.sublabel_en,
    sublabel_km: p.sublabel_km,
    weeks: (byPhase.get(p.id) ?? []).map((m) => ({
      id: m.id,
      titles: { en: m.title_en, km: m.title_km },
      focus: { en: m.focus_en, km: m.focus_km },
      activities: {
        en: splitActivities(m.activities_en),
        km: splitActivities(m.activities_km),
      },
    })),
  }));
}

function splitActivities(raw: string): string[] {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function toCacheable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const getCachedCurriculum = unstable_cache(
  async () => toCacheable(await fetchCurriculum()),
  ["curriculum-phases"],
  {
    revalidate: 60,
    tags: [CURRICULUM_CACHE_TAG],
  },
);

export async function getCurriculum(): Promise<CurriculumPhaseWithWeeks[]> {
  return getCachedCurriculum();
}

export async function getCurriculumPhaseForEdit(id: string) {
  const supabase = getSharedAdminClient();
  const { data, error } = await supabase.from("curriculum_phases").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function getCurriculumModuleForEdit(id: string) {
  const supabase = getSharedAdminClient();
  const { data, error } = await supabase.from("curriculum_modules").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}
