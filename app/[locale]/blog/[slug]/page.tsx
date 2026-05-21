import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { BlogArticleBody } from "@/components/blog/blog-article-body";
import { BlogVideoPlayer } from "@/components/blog/blog-video-player";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getPublishedBlogBySlug } from "@/lib/supabase/blog";

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
  const title = locale === "km" ? post.title_km : post.title_en;
  return { title, description: locale === "km" ? post.excerpt_km ?? undefined : post.excerpt_en ?? undefined };
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

  const title = locale === "km" ? post.title_km : post.title_en;
  const excerpt = locale === "km" ? post.excerpt_km : post.excerpt_en;
  const body = locale === "km" ? post.body_km : post.body_en;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div
        className="h-0.75"
        style={{
          background:
            "linear-gradient(to right, #d4af37 0%, rgba(212,175,55,0.45) 55%, transparent 100%)",
        }}
        aria-hidden
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <nav className="py-7">
          <Link
            href={`/${locale}/blog`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-[#0ea5e9] hover:text-sky-700"
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
        </nav>

        <header className="pb-8">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">
            {t.articleEyebrow}
          </p>
          <time
            dateTime={post.published_at}
            className="mt-3 block text-sm font-medium text-slate-500"
          >
            {formatArticleDate(post.published_at, locale)}
          </time>
          <h1 className="mt-4 text-3xl font-black leading-[1.12] tracking-tight text-[#1e293b] sm:text-4xl lg:text-[2.75rem]">
            {title}
          </h1>
          {excerpt ? (
            <p className="mt-5 text-lg leading-relaxed text-slate-600">{excerpt}</p>
          ) : null}
        </header>

        {post.featured_image_url ? (
          <div className="mb-10 overflow-hidden rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-900/8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featured_image_url}
              alt=""
              className="aspect-[16/9] w-full object-cover"
            />
          </div>
        ) : null}

        {post.videos.length > 0 ? (
          <BlogVideoPlayer
            videos={post.videos}
            locale={locale}
            articleTitle={title}
            videoHeading={t.videoHeading}
          />
        ) : null}

        <div className="rounded-2xl border border-white/90 bg-white/95 px-6 py-8 shadow-sm shadow-slate-900/5 sm:px-10 sm:py-10">
          <BlogArticleBody content={body} />
        </div>

        <div className="py-14">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0ea5e9] px-6 py-3 text-sm font-bold text-white shadow-md shadow-sky-900/15 transition hover:bg-sky-600"
          >
            {t.backToList}
          </Link>
        </div>
      </div>
    </div>
  );
}
