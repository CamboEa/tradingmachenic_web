#!/usr/bin/env node

/**
 * Upsert mentors + category links in Supabase (requires mentors tables).
 *
 * Usage: node scripts/seed-mentors.mjs
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const mentor = {
  slug: "bean-ratana",
  name_en: "Bean Ratana",
  name_km: "Bean Ratana",
  title_en: "Director of Strategic Partnership & Education",
  title_km: "នាយកផ្នែកភាពជាដៃគូយុទ្ធសាស្ត្រ និងការអប់រំ",
  bio_en:
    "Structured trading education focused on risk, process, and repeatable execution.",
  bio_km:
    "ការអប់រំពាណិជ្ជកម្មដែលមានរចនាសម្ព័ន្ធ ផ្តោតលើហានិភ័យ ដំណើរការ និងការប្រតិបត្តិដែលធ្វើម្តងហើយម្តងទៀត។",
  image_url: "/Images/mentor2.png",
  sort_order: 0,
  status: "published",
};

async function main() {
  console.log("Seeding mentors...\n");

  const { data: upserted, error: mentorError } = await supabase
    .from("mentors")
    .upsert(mentor, { onConflict: "slug" })
    .select("id, slug")
    .single();

  if (mentorError) {
    console.error("Failed to upsert mentor:", mentorError.message);
    if (
      mentorError.message.includes("mentors") ||
      mentorError.code === "PGRST205"
    ) {
      console.error(
        "\nRun the migration first: supabase/migrations/20260620140000_mentors.sql",
      );
    }
    process.exit(1);
  }

  const { error: deleteError } = await supabase
    .from("mentor_categories")
    .delete()
    .eq("mentor_id", upserted.id)
    .neq("category", "forex");

  if (deleteError) {
    console.error("Failed to clear old categories:", deleteError.message);
    process.exit(1);
  }

  const { error: categoryError } = await supabase
    .from("mentor_categories")
    .upsert(
      { mentor_id: upserted.id, category: "forex" },
      { onConflict: "mentor_id,category" },
    );

  if (categoryError) {
    console.error("Failed to link forex category:", categoryError.message);
    process.exit(1);
  }

  console.log(`Mentor ready: ${upserted.slug} (forex only)`);
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
