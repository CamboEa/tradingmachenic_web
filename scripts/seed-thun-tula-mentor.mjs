#!/usr/bin/env node

/**
 * Seed mentor ThunTula-FT + lessons from YouTube playlists (one lesson per playlist).
 *
 * Playlist snapshot: scripts/data/thun-tula-ft-playlists.snapshot.json
 * Refresh snapshot:  node scripts/fetch-thun-tula-playlists.mjs
 *
 * Usage: node scripts/seed-thun-tula-mentor.mjs
 *        node scripts/seed-thun-tula-mentor.mjs --fetch
 */

import { spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

import { THUN_TULA_PLAYLISTS } from "./data/thun-tula-ft-playlists.mjs";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_FILE = join(__dirname, "data/thun-tula-ft-playlists.snapshot.json");

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

function runYtDlp(args) {
  const result = spawnSync("yt-dlp", ["--no-update", ...args], {
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || "yt-dlp failed");
  }
  return result.stdout.trim().split("\n").filter(Boolean).map((l) => JSON.parse(l));
}

function fetchPlaylistSnapshot() {
  const playlists = runYtDlp([
    "--flat-playlist",
    "--dump-json",
    "https://www.youtube.com/@ThunTula-FT/playlists",
  ]);

  const snapshot = [];
  for (const playlist of playlists) {
    const videos = runYtDlp([
      "--flat-playlist",
      "--dump-json",
      `https://www.youtube.com/playlist?list=${playlist.id}`,
    ]);
    snapshot.push({
      id: playlist.id,
      title: playlist.title,
      count: videos.length,
      videos: videos.map((v) => ({
        playlist_index: v.playlist_index ?? null,
        id: v.id,
        title: v.title,
        duration: v.duration ?? null,
      })),
    });
  }
  return snapshot;
}

function loadSnapshot() {
  if (!existsSync(SNAPSHOT_FILE)) {
    console.log("No snapshot found — fetching playlists from YouTube...\n");
    return fetchPlaylistSnapshot();
  }
  return JSON.parse(readFileSync(SNAPSHOT_FILE, "utf8"));
}

function buildLessonsFromPlaylists(snapshot) {
  const byId = new Map(snapshot.map((p) => [p.id, p]));
  const lessons = [];

  for (const config of THUN_TULA_PLAYLISTS) {
    const playlist = byId.get(config.id);
    if (!playlist) {
      console.warn(`  ! Playlist not in snapshot: ${config.id}`);
      continue;
    }

    const videos = [...playlist.videos].sort((a, b) => {
      const ai = a.playlist_index ?? 0;
      const bi = b.playlist_index ?? 0;
      return ai - bi;
    });

    if (videos.length === 0) continue;

    const totalMinutes = videos.reduce(
      (sum, v) => sum + minutesFromDuration(v.duration),
      0,
    );
    const first = videos[0];
    const title = playlist.title.trim();

    lessons.push({
      slug: config.slug,
      title_en: title,
      title_km: title,
      summary_en: `${videos.length} episode${videos.length === 1 ? "" : "s"} from the "${title}" YouTube playlist.`,
      summary_km: `ភាគ ${videos.length} ពីបញ្ជី YouTube "${title}"។`,
      thumbnail_url: thumbnailUrl(first.id),
      approximate_minutes: totalMinutes,
      type: "free",
      objectives_en: [],
      objectives_km: [],
      status: "published",
      mentor_slug: MENTOR_SLUG,
      category: CATEGORY,
      lesson_topic_slug: config.topic,
      sort_order: config.sortOrder,
      youtube_playlist_id: config.id,
      videos: videos.map((v, index) => ({
        embed_url: embedUrl(v.id),
        title_en: (v.title ?? "").trim() || `Episode ${index + 1}`,
        title_km: (v.title ?? "").trim() || `Episode ${index + 1}`,
        sort_order: index,
      })),
    });
  }

  return lessons;
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

  let row;
  let lessonError;

  ({ data: row, error: lessonError } = await supabase
    .from("lessons")
    .insert(lessonRow)
    .select("id, slug")
    .single());

  if (
    lessonError?.message?.includes("sort_order") ||
    lessonError?.message?.includes("youtube_playlist_id")
  ) {
    const fallbackRow = { ...lessonRow };
    delete fallbackRow.sort_order;
    delete fallbackRow.youtube_playlist_id;
    ({ data: row, error: lessonError } = await supabase
      .from("lessons")
      .insert(fallbackRow)
      .select("id, slug")
      .single());
  }

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
  const snapshot = shouldFetch ? fetchPlaylistSnapshot() : loadSnapshot();
  const lessons = buildLessonsFromPlaylists(snapshot);
  const videoCount = lessons.reduce((n, l) => n + l.videos.length, 0);

  console.log(
    `Seeding ${MENTOR_SLUG}: ${lessons.length} playlist lesson(s), ${videoCount} episode(s)...\n`,
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
      console.log(
        `  + ${lesson.slug} [${lesson.lesson_topic_slug}] (${lesson.videos.length} ep)`,
      );
    } catch (err) {
      fail++;
      console.error(`  x ${lesson.slug}: ${err.message}`);
    }
  }

  console.log(`\nDone. ${ok} playlist lesson(s), ${fail} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
