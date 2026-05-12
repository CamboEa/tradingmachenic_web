#!/usr/bin/env node

/**
 * Seed script for Trading Machenic
 * Inserts sample lessons and videos into Supabase
 * 
 * Usage: node scripts/seed.mjs
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const sampleEmbedA = "https://www.youtube.com/embed/668nUCeBHyY";
const sampleEmbedB = "https://www.youtube.com/embed/scEDHsr3APg";

const thumbMarket =
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=960&q=80";
const thumbRisk =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=960&q=80";
const thumbJournal =
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=960&q=80";

const lessonsData = [
  {
    slug: "markets-and-participants",
    title_en: "Markets and participants",
    title_km: "ទីផ្សារ និងអ្នកពាក់ព័ន្ធ",
    summary_en:
      "How orders flow, who provides liquidity, and what moves prices at a high level.",
    summary_km:
      "របៀបនៃការបញ្ជាទិញ អ្នកផ្តល់សារធារណៈរឹមរឹល និងកត្តាដែលរវល់តម្លៃកំរិតទូទៅ។",
    thumbnail_url: thumbMarket,
    approximate_minutes: 14,
    type: "free",
    objectives_en: [
      "Name core market roles (maker/taker, broker).",
      "Explain bid/ask and spread in one sentence.",
    ],
    objectives_km: [
      "ហៅឈ្មោះតួនាទីសំខាន់ៗនៅក្នុងទីផ្សារ។",
      "ពន្យល់ bid/ask និង spread ក្នុងមួយប្រយោគ។",
    ],
    status: "published",
    videos: [
      {
        embed_url: sampleEmbedA,
        title_en: "Part 1 — Flow and roles",
        title_km: "ផ្នែក ១ — លំហូរ និងតួនាទី",
        sort_order: 0,
      },
      {
        embed_url: sampleEmbedB,
        title_en: "Part 2 — Liquidity and spread",
        title_km: "ផ្នែក ២ — សារធារណៈរឹមរឹល និង spread",
        sort_order: 1,
      },
    ],
  },
  {
    slug: "risk-and-position-sizing",
    title_en: "Risk and position sizing",
    title_km: "ហានិភ័យ និងកំណត់ទំហំលុយ",
    summary_en: "Define risk per trade, account heat, and a simple sizing framework.",
    summary_km:
      "កំណត់ហានិភ័យក្នុងមួយប្រតិបត្តិការ កម្តៅគណនី និងក្របខ័ណ្ឌកំណត់ទំហំលុយសាមញ្ញ។",
    thumbnail_url: thumbRisk,
    approximate_minutes: 18,
    type: "free",
    objectives_en: [
      "Set a maximum risk percentage per trade.",
      "Link stop distance to position size.",
    ],
    objectives_km: [
      "កំណត់ភាគរយហានិភ័យអតិបរមាក្នុងមួយប្រតិបត្តិការ។",
      "ភ្ជាប់ចម្ងាយ stop ទៅនឹងទំហំលុយ។",
    ],
    status: "published",
    videos: [
      {
        embed_url: sampleEmbedB,
        title_en: "Part 1 — Risk per trade",
        title_km: "ផ្នែក ១ — ហានិភ័យក្នុងមួយប្រតិបត្តិការ",
        sort_order: 0,
      },
      {
        embed_url: sampleEmbedA,
        title_en: "Part 2 — Sizing from stops",
        title_km: "ផ្នែក ២ — ទំហំលុយពីចម្ងាយ stop",
        sort_order: 1,
      },
      {
        embed_url: sampleEmbedB,
        title_en: "Part 3 — Account heat checklist",
        title_km: "ផ្នែក ៣ — បញ្ជីត្រួតពិនិត្យកម្តៅគណនី",
        sort_order: 2,
      },
    ],
  },
  {
    slug: "setup-journal-and-review",
    title_en: "Setups, journaling, and review",
    title_km: "លំនាំចូល កំណត់ត្រា និងការពិនិត្យ",
    summary_en:
      "Turn observations into rules: screenshots, tags, and weekly retrospectives.",
    summary_km:
      "បំលែងការសង្កេតទៅជាវិន័យ៖ រូបភាព ស្លាក និងការពិនិត្យឡើងវិញប្រចាំសប្តាហ៍។",
    thumbnail_url: thumbJournal,
    approximate_minutes: 16,
    type: "free",
    objectives_en: [
      "Draft a one-page playbook for your setup.",
      "Schedule a weekly review block.",
    ],
    objectives_km: [
      "សរសេរសេចក្តីសង្ខេបលេងលំនាំរបស់អ្នកក្នុងមួយទំព័រ។",
      "កំណត់ពេលវេលាពិនិត្យប្រចាំសប្តាហ៍។",
    ],
    status: "published",
    videos: [
      {
        embed_url: sampleEmbedA,
        title_en: "Part 1 — From setup to playbook",
        title_km: "ផ្នែក ១ — ពីលំនាំទៅសៀវភៅលេង",
        sort_order: 0,
      },
      {
        embed_url: sampleEmbedB,
        title_en: "Part 2 — Journal and weekly review",
        title_km: "ផ្នែក ២ — កំណត់ត្រា និងការពិនិត្យប្រចាំសប្តាហ៍",
        sort_order: 1,
      },
    ],
  },
];

async function seed() {
  console.log("🌱 Starting seed...\n");

  try {
    // Clear existing data
    console.log("Clearing existing lessons...");
    const { error: deleteError } = await supabase
      .from("lesson_videos")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteError && deleteError.code !== "PGRST116") {
      console.error("Error clearing lesson_videos:", deleteError);
    }

    const { error: deleteLessonsError } = await supabase
      .from("lessons")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (deleteLessonsError && deleteLessonsError.code !== "PGRST116") {
      console.error("Error clearing lessons:", deleteLessonsError);
    }

    // Insert lessons
    console.log("\n📚 Inserting lessons...");
    for (const lesson of lessonsData) {
      const { videos, ...lessonData } = lesson;

      const { data: insertedLesson, error: lessonError } = await supabase
        .from("lessons")
        .insert([lessonData])
        .select("id")
        .single();

      if (lessonError) {
        console.error(`Error inserting lesson ${lesson.slug}:`, lessonError);
        continue;
      }

      console.log(`✓ Inserted lesson: ${lesson.slug}`);

      // Insert videos for this lesson
      const videosToInsert = videos.map((v) => ({
        ...v,
        lesson_id: insertedLesson.id,
      }));

      const { error: videosError } = await supabase
        .from("lesson_videos")
        .insert(videosToInsert);

      if (videosError) {
        console.error(
          `Error inserting videos for ${lesson.slug}:`,
          videosError
        );
        continue;
      }

      console.log(
        `  └─ Added ${videos.length} video${videos.length !== 1 ? "s" : ""}`
      );
    }

    console.log("\n✨ Seed completed successfully!");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();
