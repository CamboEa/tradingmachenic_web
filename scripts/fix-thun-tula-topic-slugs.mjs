#!/usr/bin/env node

/**
 * Fix ThunTula lesson_topic_slug so every topic has exactly one lesson.
 *
 * Before this fix:
 *   ict   → 3 lessons (2022, PD Array, 2023)
 *   csnr  → 2 lessons (intro, entry model)
 *
 * After this fix:
 *   csnr       → 1 lesson (intro only)
 *   csnr-entry → 1 lesson (entry model)
 *   ict-2022   → 1 lesson (2022 mentorship)
 *   ict-pd-array → 1 lesson (PD Array)
 *   ict-2023   → 1 lesson (2023 mentorship)
 *
 * Usage: node scripts/fix-thun-tula-topic-slugs.mjs
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MENTOR_SLUG = "thun-tula-ft";

const NEW_TOPICS = [
  {
    slug: "csnr-entry",
    name_en: "CSNR Entry Model",
    name_km: "គំរូចូល CSNR",
    description_en: "CSNR entry model series",
    sort_order: 3,
  },
  {
    slug: "ict-2022",
    name_en: "ICT 2022 Mentorship",
    name_km: "ការណែនាំ ICT ឆ្នាំ 2022",
    description_en: "Full 2022 ICT mentorship series — market structure, PD arrays, and execution",
    sort_order: 4,
  },
  {
    slug: "ict-pd-array",
    name_en: "PD Array ICT 2022",
    name_km: "PD Array ICT ឆ្នាំ 2022",
    description_en: "In-depth PD Array concepts from the 2022 ICT mentorship",
    sort_order: 5,
  },
  {
    slug: "ict-2023",
    name_en: "ICT 2023 Mentorship",
    name_km: "ការណែនាំ ICT ឆ្នាំ 2023",
    description_en: "2023 ICT mentorship — SSMT, NWOG, and standard deviation projections",
    sort_order: 6,
  },
];

const LESSON_TOPIC_UPDATES = [
  { slug: "thun-tula-ft-csnr-entry-model", lesson_topic_slug: "csnr-entry" },
  { slug: "thun-tula-ft-2022-ict-mentorship", lesson_topic_slug: "ict-2022" },
  { slug: "thun-tula-ft-pd-array-ict-2022", lesson_topic_slug: "ict-pd-array" },
  { slug: "thun-tula-ft-2023-ict-mentorship", lesson_topic_slug: "ict-2023" },
];

async function main() {
  console.log("Fixing ThunTula topic slugs...\n");

  // Insert new topic entries
  console.log("Creating new lesson topics:");
  for (const topic of NEW_TOPICS) {
    const { error } = await supabase
      .from("lesson_topics")
      .upsert({ ...topic, mentor_slug: MENTOR_SLUG }, { onConflict: "mentor_slug,slug" });

    if (error) {
      console.error(`  x Failed to upsert topic ${topic.slug}: ${error.message}`);
      process.exit(1);
    }
    console.log(`  + ${topic.slug} — "${topic.name_en}"`);
  }

  console.log("\nUpdating lesson topic slugs:");
  for (const update of LESSON_TOPIC_UPDATES) {
    const { error } = await supabase
      .from("lessons")
      .update({ lesson_topic_slug: update.lesson_topic_slug })
      .eq("slug", update.slug)
      .eq("mentor_slug", MENTOR_SLUG);

    if (error) {
      console.error(`  x Failed to update ${update.slug}: ${error.message}`);
      process.exit(1);
    }
    console.log(`  + ${update.slug} → ${update.lesson_topic_slug}`);
  }

  // Remove the now-empty "ict" topic (optional cleanup)
  const { error: deleteIctError } = await supabase
    .from("lesson_topics")
    .delete()
    .eq("mentor_slug", MENTOR_SLUG)
    .eq("slug", "ict");

  if (deleteIctError) {
    console.warn(`  ! Could not remove old "ict" topic: ${deleteIctError.message}`);
  } else {
    console.log('\n  Removed stale "ict" topic entry.');
  }

  console.log("\nDone. Each topic now maps to exactly one lesson.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
