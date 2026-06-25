#!/usr/bin/env node

/**
 * Seed mentor ThunTula-FT + grouped lessons from @ThunTula-FT YouTube channel.
 * Multi-part series (CSNR, CRT, ICT Mentorship, etc.) become one lesson with many videos.
 *
 * Video list: scripts/data/thun-tula-ft-videos.jsonl
 * Refresh:   node scripts/seed-thun-tula-mentor.mjs --fetch
 *
 * Usage: node scripts/seed-thun-tula-mentor.mjs
 */

import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, "data/thun-tula-ft-videos.jsonl");
const CHANNEL_URL = "https://www.youtube.com/@ThunTula-FT/videos";

const MENTOR_SLUG = "thun-tula-ft";
const CATEGORY = "forex";

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
  slug: MENTOR_SLUG,
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
};

function slugify(input) {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "lesson"
  );
}

function lessonSlug(groupKey) {
  return `${MENTOR_SLUG}-${groupKey}`;
}

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

function extractEpisode(title) {
  const match =
    title.match(/\bEP\s*(\d+)\b/i) ||
    title.match(/\[ep\.\s*(\d+)\]/i) ||
    title.match(/\bep\.\s*(\d+)\b/i);
  return match ? parseInt(match[1], 10) : null;
}

function classifyVideo(video) {
  const title = video.title.trim();

  if (
    /^សេចក្តីណែនាំមេរៀន\s*CSNR/i.test(title) ||
    /CSNR\s*ENTRY\s*MODEL/i.test(title)
  ) {
    return {
      groupKey: "csnr-entry-model",
      lessonTitle: "CSNR Entry Model",
      episode: extractEpisode(title) ?? 0,
    };
  }

  if (/ONE\s*CRT\s*MODEL/i.test(title)) {
    return {
      groupKey: "one-crt-model",
      lessonTitle: "ONE CRT Model",
      episode: extractEpisode(title) ?? 0,
    };
  }

  if (/2022\s*ICT\s*MENTORSHIP/i.test(title)) {
    return {
      groupKey: "2022-ict-mentorship",
      lessonTitle: "2022 ICT Mentorship",
      episode: extractEpisode(title) ?? 99,
    };
  }

  if (/2023\s*ICT\s*MENTORSHIP/i.test(title)) {
    const topic = title.replace(/^2023\s*ICT\s*Mentorship\s*/i, "").trim();
    return {
      groupKey: "2023-ict-mentorship",
      lessonTitle: "2023 ICT Mentorship",
      episode: 0,
      videoLabel: topic || title,
    };
  }

  const lecture = title.match(/^Lecture\s*Series\s*[-–]\s*(.+)$/i);
  if (lecture) {
    const topic = lecture[1]
      .replace(
        /\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4}\s*$/i,
        "",
      )
      .trim();
    return {
      groupKey: `lecture-${slugify(topic)}`,
      lessonTitle: `Lecture Series: ${topic}`,
      episode: extractEpisode(title) ?? 0,
    };
  }

  if (/Live\s+discord\s+The\s+study\s+ict/i.test(title)) {
    return {
      groupKey: "live-discord-study-ict",
      lessonTitle: "Live Discord: The Study ICT",
      episode: extractEpisode(title) ?? 0,
    };
  }

  return {
    groupKey: `topic-${slugify(title)}-${video.id.toLowerCase()}`,
    lessonTitle: title,
    episode: 0,
    standalone: true,
  };
}

function groupVideosIntoLessons(videos) {
  const groups = new Map();

  for (const video of videos) {
    const meta = classifyVideo(video);
    const key = meta.groupKey;

    if (!groups.has(key)) {
      groups.set(key, {
        groupKey: key,
        lessonTitle: meta.lessonTitle,
        videos: [],
      });
    }

    groups.get(key).videos.push({
      ...video,
      episode: meta.episode ?? 0,
      videoLabel: meta.videoLabel,
    });
  }

  const lessons = [...groups.values()].map((group) => {
    group.videos.sort((a, b) => {
      if (a.episode !== b.episode) return a.episode - b.episode;
      return a.title.localeCompare(b.title);
    });

    const totalMinutes = group.videos.reduce(
      (sum, v) => sum + minutesFromDuration(v.duration),
      0,
    );
    const first = group.videos[0];

    return {
      slug: lessonSlug(group.groupKey),
      title_en: group.lessonTitle,
      title_km: group.lessonTitle,
      summary_en: `${group.videos.length} video${group.videos.length === 1 ? "" : "s"} from the ThunTula-FT YouTube channel.`,
      summary_km: `វីដេអូ ${group.videos.length} ករណីពីឆានែល YouTube ThunTula-FT។`,
      thumbnail_url: thumbnailUrl(first.id),
      approximate_minutes: totalMinutes,
      type: "free",
      objectives_en: [],
      objectives_km: [],
      status: "published",
      mentor_slug: MENTOR_SLUG,
      category: CATEGORY,
      videos: group.videos.map((v, index) => ({
        embed_url: embedUrl(v.id),
        title_en: v.videoLabel || v.title.trim(),
        title_km: v.videoLabel || v.title.trim(),
        sort_order: index,
      })),
    };
  });

  lessons.sort((a, b) => a.title_en.localeCompare(b.title_en));
  return lessons;
}

function fetchChannelVideos() {
  console.log(`Fetching videos from ${CHANNEL_URL} ...\n`);
  const result = spawnSync(
    "yt-dlp",
    ["--no-update", "--flat-playlist", "--dump-json", CHANNEL_URL],
    { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 },
  );

  if (result.status !== 0) {
    console.error(result.stderr || "yt-dlp failed");
    console.error("\nInstall yt-dlp: pip install -U yt-dlp");
    process.exit(1);
  }

  const lines = result.stdout.trim().split("\n").filter(Boolean);
  writeFileSync(DATA_FILE, `${lines.join("\n")}\n`, "utf8");
  console.log(`Saved ${lines.length} videos to ${DATA_FILE}\n`);
  return lines.map((line) => JSON.parse(line));
}

function loadVideos() {
  if (!existsSync(DATA_FILE)) {
    return fetchChannelVideos();
  }
  const lines = readFileSync(DATA_FILE, "utf8").trim().split("\n").filter(Boolean);
  return lines.map((line) => JSON.parse(line));
}

async function upsertMentor() {
  const { data: upserted, error: mentorError } = await supabase
    .from("mentors")
    .upsert(mentor, { onConflict: "slug" })
    .select("id, slug")
    .single();

  if (mentorError) {
    throw new Error(`Failed to upsert mentor: ${mentorError.message}`);
  }

  const { error: categoryError } = await supabase
    .from("mentor_categories")
    .upsert(
      { mentor_id: upserted.id, category: CATEGORY },
      { onConflict: "mentor_id,category" },
    );

  if (categoryError) {
    throw new Error(`Failed to link category: ${categoryError.message}`);
  }

  return upserted;
}

async function deleteExistingLessons() {
  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("id, slug")
    .eq("mentor_slug", MENTOR_SLUG);

  if (error) {
    throw new Error(`Failed to list lessons: ${error.message}`);
  }

  if (!lessons?.length) return 0;

  const ids = lessons.map((l) => l.id);
  const { error: videoError } = await supabase
    .from("lesson_videos")
    .delete()
    .in("lesson_id", ids);

  if (videoError) {
    throw new Error(`Failed to delete lesson videos: ${videoError.message}`);
  }

  const { error: lessonError } = await supabase
    .from("lessons")
    .delete()
    .eq("mentor_slug", MENTOR_SLUG);

  if (lessonError) {
    throw new Error(`Failed to delete lessons: ${lessonError.message}`);
  }

  return lessons.length;
}

async function insertLesson(lesson) {
  const { videos, ...lessonRow } = lesson;

  const { data: row, error: lessonError } = await supabase
    .from("lessons")
    .insert(lessonRow)
    .select("id, slug")
    .single();

  if (lessonError) {
    throw new Error(`Lesson ${lesson.slug}: ${lessonError.message}`);
  }

  const videosToInsert = videos.map((v) => ({
    ...v,
    lesson_id: row.id,
  }));

  const { error: videoError } = await supabase
    .from("lesson_videos")
    .insert(videosToInsert);

  if (videoError) {
    throw new Error(`Videos for ${lesson.slug}: ${videoError.message}`);
  }

  return row;
}

async function main() {
  const shouldFetch = process.argv.includes("--fetch");

  const rawVideos = shouldFetch ? fetchChannelVideos() : loadVideos();
  const lessons = groupVideosIntoLessons(rawVideos);
  const videoCount = lessons.reduce((n, l) => n + l.videos.length, 0);

  console.log(
    `Seeding ${MENTOR_SLUG}: ${lessons.length} lesson(s), ${videoCount} video(s) from ${rawVideos.length} YouTube uploads...\n`,
  );

  const upsertedMentor = await upsertMentor();
  console.log(`Mentor ready: ${upsertedMentor.slug} (${CATEGORY})`);

  const removed = await deleteExistingLessons();
  if (removed) {
    console.log(`Removed ${removed} old lesson(s)\n`);
  }

  let ok = 0;
  let fail = 0;

  for (const lesson of lessons) {
    try {
      await insertLesson(lesson);
      ok++;
      const parts =
        lesson.videos.length > 1
          ? ` (${lesson.videos.length} videos)`
          : "";
      console.log(`  + ${lesson.slug}${parts}`);
    } catch (err) {
      fail++;
      console.error(`  x ${lesson.slug}: ${err.message}`);
    }
  }

  const grouped = lessons.filter((l) => l.videos.length > 1);
  console.log(`\nDone. ${ok} lesson(s), ${fail} failed.`);
  console.log(
    `Grouped series: ${grouped.length} (${grouped.reduce((n, l) => n + l.videos.length, 0)} videos in multi-part lessons)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
