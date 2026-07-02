#!/usr/bin/env node

/**
 * Seed 17 MT5 tools into Supabase.
 *
 * Usage: npm run seed:tools
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional (upload local files to R2):
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET_TOOL, NEXT_PUBLIC_R2_PUBLIC_URL
 *
 * Place files at: scripts/seed-assets/tools/{seed_slug}.zip (or .ex5 / .mq5)
 * See scripts/seed-assets/tools/README.md
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { toolsData, TOOLS_SEED_COUNT } from "./tools-data.mjs";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, "seed-assets", "tools");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function r2Ready() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_TOOL &&
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
  );
}

function createR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

function findLocalFile(seedSlug) {
  for (const ext of [".zip", ".ex5", ".mq5"]) {
    const path = join(ASSETS_DIR, `${seedSlug}${ext}`);
    if (existsSync(path)) return { path, ext };
  }
  return null;
}

function contentTypeForExt(ext) {
  if (ext === ".zip") return "application/zip";
  return "application/octet-stream";
}

async function uploadToR2(seedSlug, tool) {
  const local = findLocalFile(seedSlug);
  if (!local) return null;

  const r2 = createR2Client();
  const body = readFileSync(local.path);
  const typeFolder = tool.type === "indicator" ? "indicator" : "expert_advisor";
  const filename = `${seedSlug}${local.ext}`.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `seed/${typeFolder}/${seedSlug}/${Date.now()}-${filename}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_TOOL,
      Key: key,
      Body: body,
      ContentType: contentTypeForExt(local.ext),
    }),
  );

  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
}

function toRow(tool, fileUrl) {
  const rest = { ...tool };
  delete rest.seed_slug;
  return {
    ...rest,
    gallery: [],
    file_url: fileUrl,
    file_url_mt4: null,
    file_url_mt5: null,
    install_guide_url: null,
    status: fileUrl ? "published" : "draft",
  };
}

async function seedTools() {
  console.log(`Seeding ${TOOLS_SEED_COUNT} MT5 tools…\n`);

  if (!r2Ready()) {
    console.log(
      "ℹ️  R2 env not set — tools will be draft until you upload files via Admin or add R2 creds + local files.\n",
    );
  }

  let inserted = 0;
  let updated = 0;
  let withFiles = 0;

  for (const tool of toolsData) {
    let fileUrl = null;

    if (r2Ready()) {
      try {
        fileUrl = await uploadToR2(tool.seed_slug, tool);
        if (fileUrl) withFiles++;
      } catch (err) {
        console.warn(`⚠️  R2 upload failed for ${tool.seed_slug}:`, err.message);
      }
    }

    const row = toRow(tool, fileUrl);

    const { data: existing } = await supabase
      .from("tools")
      .select("id, file_url")
      .eq("name", tool.name)
      .maybeSingle();

    if (existing) {
      const patch = { ...row };
      if (!fileUrl && existing.file_url) {
        patch.file_url = existing.file_url;
        patch.status = "published";
      }

      const { error } = await supabase.from("tools").update(patch).eq("id", existing.id);
      if (error) {
        console.error(`✗ update ${tool.name}:`, error.message);
        continue;
      }
      updated++;
      console.log(
        `↻ ${tool.name} (${patch.status}${patch.file_url ? ", file linked" : ", no file yet"})`,
      );
    } else {
      const { error } = await supabase.from("tools").insert([row]);
      if (error) {
        console.error(`✗ insert ${tool.name}:`, error.message);
        continue;
      }
      inserted++;
      console.log(`✓ ${tool.name} (${row.status})`);
    }
  }

  console.log(
    `\n✨ Done. ${inserted} inserted, ${updated} updated, ${withFiles} file(s) uploaded from ${ASSETS_DIR}`,
  );
  console.log("   View: /admin/tools and /en/tools");
  console.log(
    "\n⚠️  We do not download third-party .ex5 files from the internet.",
  );
  console.log("   Add your own builds to scripts/seed-assets/tools/ and re-run, or upload in Admin.\n");
}

seedTools().catch((err) => {
  console.error("Tools seed failed:", err);
  process.exit(1);
});
