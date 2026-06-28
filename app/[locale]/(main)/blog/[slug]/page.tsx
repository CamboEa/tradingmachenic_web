import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PublicPageHero, PublicPageMain } from "@/components/ui";

import { BlogArticleBody } from "@/components/blog/blog-article-body";
import { BlogVideoPlayer } from "@/components/blog/blog-video-player";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import {
  blogLocalizedBody,
  blogLocalizedExcerpt,
  blogLocalizedTitle,
  getPublishedBlogBySlug,
} from "@/lib/supabase/blog";

export const dynamic = "force-dynamic";

function formatArticleDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(locale === "km" ? "km-KH" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return { title: "Blog" };
  const locale = raw as Locale;
  const post = await getPublishedBlogBySlug(slug);
  if (!post) return { title: "Blog" };
  const title = blogLocalizedTitle(post, locale);
  const excerpt = blogLocalizedExcerpt(post, locale);
  return { title, description: excerpt ?? undefined };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const t = dict.blogPage;

  const post = await getPublishedBlogBySlug(slug);
  if (!post) notFound();

  const title = blogLocalizedTitle(post, locale);
  const excerpt = blogLocalizedExcerpt(post, locale);
  const body = blogLocalizedBody(post, locale);
  const hasVideos = post.videos.length > 0;

  return (
    <div className="flex flex-col bg-background">
      <PublicPageHero
        title={title}
        panel={
          <div className="mx-auto w-full max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              <Link href={`/${locale}/blog`} className="inline-flex items-center gap-1.5 text-white/80 transition hover:text-gold">
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden>
                  <path fillRule="evenodd" d="M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 1.06L6.06 8l3.72 3.72a.75.75 0 0 1 0 1.06Z" clipRule="evenodd" />
                </svg>
                {t.backToList}
              </Link>
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="rounded-md bg-teal/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {t.articleEyebrow}
              </span>
              <time dateTime={post.published_at} className="font-mono text-[10px] text-slate-300">
                {formatArticleDate(post.published_at, locale)}
              </time>
            </div>

            <h1 className="mt-4 text-3xl font-black leading-[1.12] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
              {title}
            </h1>

            {excerpt ? (
              <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-100/90 sm:text-lg">
                {excerpt}
              </p>
            ) : null}
          </div>
        }
      />

      <PublicPageMain className="max-w-4xl pb-16 pt-10">
        {post.featured_image_url ? (
          <div className="overflow-hidden rounded-2xl border border-bridge/40 bg-surface-soft shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featured_image_url}
              alt={title}
              loading="lazy"
              className="aspect-video w-full object-cover"
            />
          </div>
        ) : null}

        <div className="mt-10">
          {hasVideos ? (
            <div className="border-y border-bridge/30 py-8">
              <BlogVideoPlayer
                videos={post.videos}
                locale={locale}
                articleTitle={title}
                videoHeading={t.videoHeading}
              />
            </div>
          ) : null}

          <div className={hasVideos ? "pt-10" : "pt-2"}>
            <BlogArticleBody content={body} />
          </div>
        </div>

        <div className="mt-12 flex justify-center border-t border-bridge/30 pt-8">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 rounded-lg border border-bridge bg-surface px-6 py-3 text-sm font-bold text-ink-muted transition hover:border-gold hover:text-foreground"
          >
            {t.backToList}
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M4 10a.75.75 0 0 1 .75-.75h7.69l-2.22-2.22a.75.75 0 1 1 1.06-1.06l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 1 1-1.06-1.06l2.22-2.22H4.75A.75.75 0 0 1 4 10Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </PublicPageMain>
    </div>
  );
}
