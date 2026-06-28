#!/usr/bin/env node

/**
 * Seed mentor Jesse Livermore's Trading Rules + 3 thematic lessons.
 *
 * Video snapshot: scripts/data/jesse-livermore-videos.json
 *
 * Usage: node scripts/seed-jesse-livermore-mentor.mjs
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const VIDEOS_FILE = join(__dirname, "data/jesse-livermore-videos.json");

const MENTOR_SLUG = "jesse-livermore-trading-rules";
const CATEGORY = "forex";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const mentor = {
  slug: MENTOR_SLUG,
  name_en: "Jesse Livermore's Trading Rules",
  name_km: "វិធីប្រតិបត្តិ Jesse Livermore",
  title_en: "Classic Trading Wisdom & Market Psychology",
  title_km: "ប្រាជ្ញាពាណិជ្ជកម្មបុរាណ និងចិត្តសាស្ត្រទីផ្សារ",
  bio_en:
    "Timeless principles from the legendary Jesse Livermore — market psychology, disciplined pattern recognition, and the mindset that separates consistent winners from the crowd.",
  bio_km:
    "គោលការណ៍អស់កល្បជានិច្ចពី Jesse Livermore ព្រះអង្គវីរបុរសនៃការជួញដូរ — ចិត្តសាស្ត្រទីផ្សារ ការស្គាល់លំនាំដោយវិន័យ និងផ្នត់គំនិតដែលបំបែកអ្នកឈ្នះចេញពីហ្វូង។",
  image_url: "/Images/mentor.png",
  sort_order: 2,
  status: "published",
};

const TOPICS = [
  {
    slug: "psychology",
    name_en: "Trading Psychology",
    name_km: "ចិត្តសាស្ត្រការជួញដូរ",
    description_en: "Mindset, discipline, and the mental edge every trader needs",
    sort_order: 1,
  },
  {
    slug: "strategy",
    name_en: "Technical Strategies",
    name_km: "យុទ្ធសាស្ត្របច្ចេកទេស",
    description_en: "Indicators, price patterns, and technical execution",
    sort_order: 2,
  },
  {
    slug: "risk",
    name_en: "Risk & Execution",
    name_km: "ហានិភ័យ និងការប្រតិបត្តិ",
    description_en: "Risk management, trade exits, and building a repeatable system",
    sort_order: 3,
  },
];

const LESSON_CONFIGS = [
  {
    slug: "jesse-livermore-psychology",
    topic: "psychology",
    title_en: "Trading Psychology & Mindset",
    title_km: "ចិត្តសាស្ត្រ និងផ្នត់គំនិតក្នុងការជួញដូរ",
    summary_en: "Jesse Livermore's mental frameworks — why most traders fail and how to build the discipline that creates consistent winners.",
    summary_km: "ក្របខ័ណ្ឌផ្លូវចិត្តរបស់ Jesse Livermore — ហេតុអ្វីអ្នកជួញដូរភាគច្រើនបរាជ័យ និងរបៀបបង្កើតវិន័យដែលបង្កើតអ្នកឈ្នះស្ថិរ។",
    sortOrder: 1,
    groups: ["psychology"],
  },
  {
    slug: "jesse-livermore-strategy",
    topic: "strategy",
    title_en: "Technical Strategies & Indicators",
    title_km: "យុទ្ធសាស្ត្របច្ចេកទេស និងសូចនាករ",
    summary_en: "How Jesse Livermore approached indicators and price patterns — the hidden edges in VWAP, Fibonacci, Moving Averages, and RSI.",
    summary_km: "របៀបដែល Jesse Livermore ចូលទៅជិតសូចនាករ និងលំនាំតម្លៃ — គែមលាក់ក្នុង VWAP, Fibonacci, Moving Averages, និង RSI។",
    sortOrder: 2,
    groups: ["strategy"],
  },
  {
    slug: "jesse-livermore-risk",
    topic: "risk",
    title_en: "Risk Management & Trade Execution",
    title_km: "ការគ្រប់គ្រងហានិភ័យ និងការប្រតិបត្តិ",
    summary_en: "The exit strategies, risk frameworks, and systems thinking that let Jesse Livermore trade with confidence and precision.",
    summary_km: "យុទ្ធសាស្ត្រចាកចេញ ក្របខ័ណ្ឌហានិភ័យ និងការគិតអំពីប្រព័ន្ធដែលអនុញ្ញាតឱ្យ Jesse Livermore ជួញដូរដោយទំនុកចិត្ត។",
    sortOrder: 3,
    groups: ["risk"],
  },
];

function embedUrl(videoId) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
}

function thumbnailUrl(videoId) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function minutesFromDuration(seconds) {
  if (!seconds || !Number.isFinite(seconds)) return 10;
  return Math.max(1, Math.ceil(seconds / 60));
}

async function upsertMentor() {
  const { data: upserted, error: mentorError } = await supabase
    .from("mentors")
    .upsert(mentor, { onConflict: "slug" })
    .select("id, slug")
    .single();

  if (mentorError) throw new Error(`Failed to upsert mentor: ${mentorError.message}`);

  const { error: categoryError } = await supabase
    .from("mentor_categories")
    .upsert(
      { mentor_id: upserted.id, category: CATEGORY },
      { onConflict: "mentor_id,category" },
    );

  if (categoryError) throw new Error(`Failed to link category: ${categoryError.message}`);

  return upserted;
}

async function upsertTopics() {
  for (const topic of TOPICS) {
    const { error } = await supabase
      .from("lesson_topics")
      .upsert(
        { ...topic, mentor_slug: MENTOR_SLUG },
        { onConflict: "mentor_slug,slug" },
      );
    if (error) throw new Error(`Failed to upsert topic ${topic.slug}: ${error.message}`);
    console.log(`  Topic: ${topic.slug}`);
  }
}

async function deleteExistingLessons() {
  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("id")
    .eq("mentor_slug", MENTOR_SLUG);

  if (error) throw new Error(`Failed to list lessons: ${error.message}`);
  if (!lessons?.length) return 0;

  const ids = lessons.map((l) => l.id);

  const { error: videoError } = await supabase
    .from("lesson_videos")
    .delete()
    .in("lesson_id", ids);
  if (videoError) throw new Error(`Failed to delete videos: ${videoError.message}`);

  const { error: lessonError } = await supabase
    .from("lessons")
    .delete()
    .eq("mentor_slug", MENTOR_SLUG);
  if (lessonError) throw new Error(`Failed to delete lessons: ${lessonError.message}`);

  return lessons.length;
}

async function insertLesson(lessonRow, videos) {
  const { data: row, error: lessonError } = await supabase
    .from("lessons")
    .insert(lessonRow)
    .select("id, slug")
    .single();

  if (lessonError) throw new Error(`Lesson ${lessonRow.slug}: ${lessonError.message}`);

  const { error: videoError } = await supabase
    .from("lesson_videos")
    .insert(videos.map((v) => ({ ...v, lesson_id: row.id })));

  if (videoError) throw new Error(`Videos for ${lessonRow.slug}: ${videoError.message}`);

  return row;
}

async function main() {
  const allVideos = JSON.parse(readFileSync(VIDEOS_FILE, "utf8"));

  console.log(`Seeding ${MENTOR_SLUG}...\n`);

  const upsertedMentor = await upsertMentor();
  console.log(`Mentor ready: ${upsertedMentor.slug} (${CATEGORY})\n`);

  console.log("Upserting lesson topics:");
  await upsertTopics();
  console.log();

  const removed = await deleteExistingLessons();
  if (removed) console.log(`Removed ${removed} old lesson(s)\n`);

  let ok = 0;
  let fail = 0;

  for (const config of LESSON_CONFIGS) {
    const groupVideos = allVideos
      .filter((v) => config.groups.includes(v.group))
      .sort((a, b) => (a.playlist_index ?? 0) - (b.playlist_index ?? 0));

    if (groupVideos.length === 0) {
      console.warn(`  ! No videos for lesson ${config.slug}`);
      continue;
    }

    const totalMinutes = groupVideos.reduce(
      (sum, v) => sum + minutesFromDuration(v.duration),
      0,
    );
    const firstVideo = groupVideos[0];

    const lessonRow = {
      slug: config.slug,
      title_en: config.title_en,
      title_km: config.title_km,
      summary_en: config.summary_en,
      summary_km: config.summary_km,
      thumbnail_url: thumbnailUrl(firstVideo.id),
      approximate_minutes: totalMinutes,
      type: "free",
      objectives_en: [],
      objectives_km: [],
      status: "published",
      mentor_slug: MENTOR_SLUG,
      category: CATEGORY,
      lesson_topic_slug: config.topic,
      sort_order: config.sortOrder,
    };

    const lessonVideos = groupVideos.map((v, index) => ({
      embed_url: embedUrl(v.id),
      title_en: v.title.trim(),
      title_km: v.title.trim(),
      sort_order: index,
    }));

    try {
      await insertLesson(lessonRow, lessonVideos);
      ok++;
      console.log(`  + ${config.slug} [${config.topic}] (${groupVideos.length} videos)`);
    } catch (err) {
      fail++;
      console.error(`  x ${config.slug}: ${err.message}`);
    }
  }

  console.log(`\nDone. ${ok} lesson(s) seeded, ${fail} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
