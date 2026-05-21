#!/usr/bin/env node

/**
 * Seed professional sample blog posts into Supabase.
 *
 * Usage: npm run seed:blog
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in .env
 */

import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { blogPostsData } from "./blog-posts-data.mjs";

dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedBlog() {
  console.log("Seeding blog posts…\n");

  for (const post of blogPostsData) {
    const row = {
      slug: post.slug,
      title_en: post.title_en,
      title_km: post.title_km,
      excerpt_en: post.excerpt_en,
      excerpt_km: post.excerpt_km,
      body_en: post.body_en,
      body_km: post.body_km,
      featured_image_url: post.featured_image_url,
      published_at: post.published_at,
      status: post.status,
      videos: post.videos ?? [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("blog_posts").upsert(row, { onConflict: "slug" });

    if (error) {
      console.error(`✗ ${post.slug}:`, error.message);
      continue;
    }

    console.log(`✓ ${post.slug}`);
  }

  console.log("\n✨ Blog seed complete. View at /en/blog");
}

seedBlog().catch((err) => {
  console.error("Blog seed failed:", err);
  process.exit(1);
});
