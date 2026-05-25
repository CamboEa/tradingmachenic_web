import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
    <div className="flex flex-col">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="border-b border-slate-200 pb-4">
          <nav className="flex items-center justify-between gap-4">
            <Link
              href={`/${locale}/blog`}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-[#0ea5e9]"
            >
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-4 w-4 transition group-hover:-translate-x-0.5"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M14 8a.75.75 0 0 1-.75.75H4.56l3.22 3.22a.75.75 0 1 1-1.06 1.06l-4.5-4.5a.75.75 0 0 1 0-1.06l4.5-4.5a.75.75 0 0 1 1.06 1.06L4.56 7.25h8.69A.75.75 0 0 1 14 8Z"
                  clipRule="evenodd"
                />
              </svg>
              {t.backToList}
            </Link>
            <time
              dateTime={post.published_at}
              className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400"
            >
              {formatArticleDate(post.published_at, locale)}
            </time>
          </nav>
        </div>

        <header className="border-b border-slate-200 pb-8 pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">
            {t.articleEyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-black leading-[1.12] tracking-tight text-slate-900 sm:text-4xl lg:text-[2.6rem]">
            {title}
          </h1>
          {excerpt ? (
            <p className="mt-5 text-lg leading-relaxed text-slate-600">{excerpt}</p>
          ) : null}
        </header>

        {post.featured_image_url ? (
          <div className="mt-8 border border-slate-200 bg-slate-100">
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
            <div className="border-y border-slate-200 py-8">
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

        <div className="mt-12 flex justify-center border-t border-slate-200 pt-8">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 rounded-none border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
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
      </main>
    </div>
  );
}
