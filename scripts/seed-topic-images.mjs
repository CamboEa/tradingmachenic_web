#!/usr/bin/env node

/**
 * Seed cover images for lesson topics.
 * Images are sourced from Unsplash (already in next.config.ts remotePatterns).
 *
 * Usage: node scripts/seed-topic-images.mjs
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Each entry matches by mentor_slug + topic slug
const TOPIC_IMAGES = [
  // ── Thun Tula FT ─────────────────────────────────────────────────────────
  {
    mentor_slug: "thun-tula-ft",
    slug: "ict",
    // Multi-monitor trading desk — classic ICT analysis vibe
    image_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&fit=crop",
  },
  {
    mentor_slug: "thun-tula-ft",
    slug: "csnr",
    // Close-up candlestick chart on screen — fits supply/demand narrative
    image_url: "https://images.unsplash.com/photo-1590283603385-17d9619d5869?w=800&q=80&fit=crop",
  },
  {
    mentor_slug: "thun-tula-ft",
    slug: "crt",
    // Laptop with detailed financial chart lines — candle range theory
    image_url: "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=800&q=80&fit=crop",
  },
  {
    mentor_slug: "thun-tula-ft",
    slug: "lecture-series",
    // Person studying at desk with notes — education / lecture feel
    image_url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80&fit=crop",
  },
  {
    mentor_slug: "thun-tula-ft",
    slug: "execution",
    // Hands on keyboard ready to execute — precision & speed
    image_url: "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=800&q=80&fit=crop",
  },
  {
    mentor_slug: "thun-tula-ft",
    slug: "general",
    // Currency coins & banknotes — general forex overview
    image_url: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80&fit=crop",
  },

  // ── Jesse Livermore ───────────────────────────────────────────────────────
  {
    mentor_slug: "jesse-livermore-trading-rules",
    slug: "psychology",
    // Person silhouette at sunrise — discipline & mental edge
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&fit=crop",
  },
  {
    mentor_slug: "jesse-livermore-trading-rules",
    slug: "strategy",
    // MacBook showing stock charts — technical strategy
    image_url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&fit=crop",
  },
  {
    mentor_slug: "jesse-livermore-trading-rules",
    slug: "risk",
    // Analytics dashboard with data — risk & measurement
    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&fit=crop",
  },

  // ── Bean Ratana ───────────────────────────────────────────────────────────
  // Add entries here if Bean Ratana has topics in your DB.
  // Example:
  // {
  //   mentor_slug: "bean-ratana",
  //   slug: "your-topic-slug",
  //   image_url: "https://images.unsplash.com/photo-XXXX?w=800&q=80&fit=crop",
  // },
];

async function main() {
  console.log(`Seeding images for ${TOPIC_IMAGES.length} topic(s)...\n`);

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of TOPIC_IMAGES) {
    const { data: topic, error: fetchError } = await supabase
      .from("lesson_topics")
      .select("id, slug")
      .eq("mentor_slug", entry.mentor_slug)
      .eq("slug", entry.slug)
      .maybeSingle();

    if (fetchError) {
      console.error(`  x [${entry.mentor_slug}/${entry.slug}] fetch error: ${fetchError.message}`);
      failed++;
      continue;
    }

    if (!topic) {
      console.warn(`  ~ [${entry.mentor_slug}/${entry.slug}] not found — skipping`);
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("lesson_topics")
      .update({ image_url: entry.image_url })
      .eq("id", topic.id);

    if (updateError) {
      console.error(`  x [${entry.mentor_slug}/${entry.slug}] update error: ${updateError.message}`);
      failed++;
      continue;
    }

    console.log(`  ✓ [${entry.mentor_slug}/${entry.slug}]`);
    ok++;
  }

  console.log(`\nDone. ${ok} updated, ${skipped} skipped, ${failed} failed.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
