#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "data/thun-tula-ft-playlists.snapshot.json");

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

const playlists = runYtDlp([
  "--flat-playlist",
  "--dump-json",
  "https://www.youtube.com/@ThunTula-FT/playlists",
]);

const all = [];
for (const playlist of playlists) {
  const videos = runYtDlp([
    "--flat-playlist",
    "--dump-json",
    `https://www.youtube.com/playlist?list=${playlist.id}`,
  ]);
  all.push({
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
  console.log(`${String(videos.length).padStart(2)} | ${playlist.title}`);
}

writeFileSync(OUT, `${JSON.stringify(all, null, 2)}\n`, "utf8");
console.log(`\nSaved ${OUT}`);
