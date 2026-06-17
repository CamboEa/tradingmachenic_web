#!/usr/bin/env node

/**
 * Seed tools from public/Tools20/catalog.json + upload .mq5 files to Cloudflare R2.
 *
 * Usage: npm run seed:tools20
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET_TOOL, NEXT_PUBLIC_R2_PUBLIC_URL
 */

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const TOOLS_DIR = join(ROOT, "public", "Tools20");
const CATALOG_PATH = join(TOOLS_DIR, "catalog.json");

const IMAGES = [
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1642790551117-97e405cb55de?auto=format&fit=crop&w=960&q=80",
  "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=960&q=80",
];

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

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

function contentTypeForFile(filename) {
  if (filename.endsWith(".zip")) return "application/zip";
  if (filename.endsWith(".mq5")) return "application/octet-stream";
  if (filename.endsWith(".ex5")) return "application/octet-stream";
  return "application/octet-stream";
}

async function uploadMq5ToR2(tool, filePath) {
  const r2 = createR2Client();
  const body = readFileSync(filePath);
  const typeFolder = tool.type === "indicator" ? "indicator" : "expert_advisor";
  const safeName = tool.file.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `tools20/${typeFolder}/${tool.seed_slug}/${safeName}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_TOOL,
      Key: key,
      Body: body,
      ContentType: contentTypeForFile(tool.file),
    }),
  );

  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
}

function toDbRow(tool, fileUrl, imageUrl) {
  return {
    name: tool.name,
    type: tool.type,
    platform: tool.platform,
    pricing: tool.pricing,
    version: tool.version,
    description_en: tool.description_en ?? null,
    description_km: tool.description_km ?? null,
    requirements_en: tool.requirements_en ?? null,
    requirements_km: tool.requirements_km ?? null,
    how_it_works_en: tool.how_it_works_en ?? null,
    how_it_works_km: tool.how_it_works_km ?? null,
    key_features_en: tool.key_features_en ?? null,
    key_features_km: tool.key_features_km ?? null,
    usage_notes_en: tool.usage_notes_en ?? null,
    usage_notes_km: tool.usage_notes_km ?? null,
    proof_of_testing_en: tool.proof_of_testing_en ?? null,
    proof_of_testing_km: tool.proof_of_testing_km ?? null,
    image_url: imageUrl,
    gallery: [],
    file_url: fileUrl,
    file_url_mt4: null,
    file_url_mt5: null,
    install_guide_url: null,
    status: fileUrl ? "published" : "draft",
  };
}

async function seedTools20() {
  if (!existsSync(CATALOG_PATH)) {
    console.error(`Catalog not found: ${CATALOG_PATH}`);
    process.exit(1);
  }

  if (!r2Ready()) {
    console.error(
      "Missing R2 env vars (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_TOOL, NEXT_PUBLIC_R2_PUBLIC_URL)",
    );
    process.exit(1);
  }

  const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
  const tools = catalog.tools ?? [];

  console.log(`Seeding ${tools.length} tools from Tools20…\n`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  let inserted = 0;
  let updated = 0;
  let uploaded = 0;
  let skipped = 0;

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    const filePath = join(TOOLS_DIR, tool.file);

    if (!existsSync(filePath)) {
      console.error(`✗ ${tool.name}: missing file ${tool.file}`);
      skipped++;
      continue;
    }

    let fileUrl = null;
    try {
      fileUrl = await uploadMq5ToR2(tool, filePath);
      uploaded++;
    } catch (err) {
      console.error(`✗ R2 upload failed for ${tool.name}:`, err.message);
      skipped++;
      continue;
    }

    const imageUrl = IMAGES[i % IMAGES.length];
    const row = toDbRow(tool, fileUrl, imageUrl);

    const { data: existing } = await supabase
      .from("tools")
      .select("id")
      .eq("name", tool.name)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from("tools").update(row).eq("id", existing.id);
      if (error) {
        console.error(`✗ update ${tool.name}:`, error.message);
        skipped++;
        continue;
      }
      updated++;
      console.log(`↻ ${tool.name} → published (${tool.file})`);
    } else {
      const { error } = await supabase.from("tools").insert([row]);
      if (error) {
        console.error(`✗ insert ${tool.name}:`, error.message);
        skipped++;
        continue;
      }
      inserted++;
      console.log(`✓ ${tool.name} → published (${tool.file})`);
    }
  }

  console.log(
    `\n✨ Done. ${inserted} inserted, ${updated} updated, ${uploaded} uploaded to R2, ${skipped} skipped.`,
  );
  console.log("   Public: /en/tools  |  Admin: /admin/tools\n");
}

seedTools20().catch((err) => {
  console.error("Tools20 seed failed:", err);
  process.exit(1);
});
