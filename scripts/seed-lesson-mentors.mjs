#!/usr/bin/env node

/**
 * Assign mentor + category on all existing lessons (no delete/re-insert).
 *
 * Usage: node scripts/seed-lesson-mentors.mjs
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MENTOR_SLUG = "bean-ratana";
const CATEGORY = "forex";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log(`Assigning all lessons to ${CATEGORY} / ${MENTOR_SLUG}...\n`);

  const { data: lessons, error: fetchError } = await supabase
    .from("lessons")
    .select("id, slug, mentor_slug, category");

  if (fetchError) {
    console.error("Failed to read lessons:", fetchError.message);
    if (fetchError.message.includes("mentor_slug") || fetchError.message.includes("category")) {
      console.error(
        "\nRun the migration first: supabase/migrations/20260620120000_lesson_mentor_category.sql",
      );
    }
    process.exit(1);
  }

  if (!lessons?.length) {
    console.log("No lessons found in the database.");
    return;
  }

  const { data: updated, error: updateError } = await supabase
    .from("lessons")
    .update({ mentor_slug: MENTOR_SLUG, category: CATEGORY })
    .neq("id", "00000000-0000-0000-0000-000000000000")
    .select("slug, mentor_slug, category");

  if (updateError) {
    console.error("Failed to update lessons:", updateError.message);
    process.exit(1);
  }

  console.log(`Updated ${updated?.length ?? 0} lesson(s):\n`);
  for (const row of updated ?? []) {
    console.log(`  ${row.slug} -> ${row.category} / ${row.mentor_slug}`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
