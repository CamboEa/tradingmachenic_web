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

const mentors = [
  {
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
    categories: ["forex"],
  },
  {
    slug: "thun-tula-ft",
    name_en: "Thun Tula",
    name_km: "ធាន ទុយឡា",
    title_en: "Forex & ICT Trading Educator",
    title_km: "គ្រូបង្រៀនពាណិជ្ជកម្ម Forex និង ICT",
    bio_en:
      "Free structured forex education on YouTube — ICT concepts, market structure, and practical execution.",
    bio_km:
      "ការអប់រំ Forex ឥតគិតថ្លៃលើ YouTube — គោលគំនិត ICT រចនាសម្ព័ន្ធទីផ្សារ និងការប្រតិបត្តិជាក់ស្តែង។",
    image_url: "/Images/thun-tula-ft.png",
    sort_order: 1,
    status: "published",
    categories: ["forex"],
  },
];

async function main() {
  console.log("Seeding mentors...\n");

  for (const mentor of mentors) {
    const { categories, ...row } = mentor;

    const { data: upserted, error: mentorError } = await supabase
      .from("mentors")
      .upsert(row, { onConflict: "slug" })
      .select("id, slug")
      .single();

    if (mentorError) {
      console.error(`Failed to upsert ${mentor.slug}:`, mentorError.message);
      process.exit(1);
    }

    const { error: deleteError } = await supabase
      .from("mentor_categories")
      .delete()
      .eq("mentor_id", upserted.id);

    if (deleteError) {
      console.error(`Failed to clear categories for ${mentor.slug}:`, deleteError.message);
      process.exit(1);
    }

    for (const category of categories) {
      const { error: categoryError } = await supabase
        .from("mentor_categories")
        .upsert(
          { mentor_id: upserted.id, category },
          { onConflict: "mentor_id,category" },
        );

      if (categoryError) {
        console.error(`Failed to link ${category} for ${mentor.slug}:`, categoryError.message);
        process.exit(1);
      }
    }

    console.log(`Mentor ready: ${upserted.slug} (${categories.join(", ")})`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
