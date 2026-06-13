import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyState, PublicPageHero, PublicPageMain } from "@/components/ui";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import {
  blogLocalizedExcerpt,
  blogLocalizedTitle,
  getPublishedBlogPosts,
} from "@/lib/supabase/blog";

export const dynamic = "force-dynamic";

function formatArticleDate(iso: string, locale: Locale) {
  return new Date(iso).toLocaleDateString(locale === "km" ? "km-KH" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const t = dict.blogPage;
  const posts = await getPublishedBlogPosts();
  const [featured, ...rest] = posts;
  const latest = rest.slice(0, 4);
  const more = rest.slice(4);
  const hasLatest = latest.length > 0;

  return (
    <div className="flex flex-col">
      <PublicPageHero eyebrow={t.eyebrow} title={t.title} description={t.intro} />
      <PublicPageMain className="pb-16">
        {posts.length === 0 ? (
          <EmptyState title={t.emptyTitle} description={t.emptyBody} />
        ) : (
          <div>
            <div className="grid gap-8 lg:grid-cols-12">
              {featured ? (
                <Link
                  href={`/${locale}/blog/${featured.slug}`}
                  className={[
                    "group ui-content-card relative overflow-hidden",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] focus-visible:outline-solid",
                    hasLatest ? "lg:col-span-8" : "lg:col-span-12",
                  ].join(" ")}
                  aria-label={blogLocalizedTitle(featured, locale)}
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    {featured.featured_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featured.featured_image_url}
                        alt={blogLocalizedTitle(featured, locale)}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 via-white to-[#EFF6FF]">
                        <svg
                          viewBox="0 0 64 64"
                          className="h-14 w-14 text-slate-300"
                          aria-hidden
                          fill="none"
                        >
                          <rect x="10" y="12" width="44" height="40" rx="8" stroke="currentColor" strokeWidth="2" />
                          <path
                            d="M18 42l10-12 9 7 9-13"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <circle cx="28" cy="30" r="2.5" fill="currentColor" />
                          <circle cx="37" cy="37" r="2.5" fill="currentColor" />
                          <circle cx="46" cy="24" r="2.5" fill="currentColor" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col p-6 sm:p-7">
                    <time
                      dateTime={featured.published_at}
                      className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400"
                    >
                      {formatArticleDate(featured.published_at, locale)}
                    </time>
                    <h2 className="mt-3 text-xl font-bold leading-snug text-slate-900 transition group-hover:text-[#2563EB] sm:text-2xl">
                      {blogLocalizedTitle(featured, locale)}
                    </h2>
                    {blogLocalizedExcerpt(featured, locale) ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-500">
                        {blogLocalizedExcerpt(featured, locale)}
                      </p>
                    ) : null}
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB]">
                      {t.readArticle}
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4 transition group-hover:translate-x-0.5"
                        aria-hidden
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 10a.75.75 0 0 1 .75-.75h7.69l-2.22-2.22a.75.75 0 1 1 1.06-1.06l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 1 1-1.06-1.06l2.22-2.22H4.75A.75.75 0 0 1 4 10Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              ) : null}

              {hasLatest ? (
                <aside className="lg:col-span-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                      Latest
                    </p>
                  </div>
                  <ul className="mt-4 space-y-4">
                    {latest.map((post) => {
                      const title = blogLocalizedTitle(post, locale);
                      const excerpt = blogLocalizedExcerpt(post, locale);
                      return (
                        <li key={post.id} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                          <Link
                            href={`/${locale}/blog/${post.slug}`}
                            className="group block"
                            aria-label={title}
                          >
                            <time
                              dateTime={post.published_at}
                              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400"
                            >
                              {formatArticleDate(post.published_at, locale)}
                            </time>
                            <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900 transition group-hover:text-[#2563EB]">
                              {title}
                            </p>
                            {excerpt ? (
                              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                                {excerpt}
                              </p>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </aside>
              ) : null}
            </div>

            {more.length > 0 ? (
              <section className="mt-12">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    More stories
                  </p>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {more.map((post) => {
                    const title = blogLocalizedTitle(post, locale);
                    const excerpt = blogLocalizedExcerpt(post, locale);
                    return (
                      <Link
                        key={post.id}
                        href={`/${locale}/blog/${post.slug}`}
                        className="group ui-content-card flex h-full flex-col overflow-hidden"
                        aria-label={title}
                      >
                        <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                          {post.featured_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.featured_image_url}
                              alt={title}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 via-white to-[#EFF6FF]">
                              <svg
                                viewBox="0 0 64 64"
                                className="h-12 w-12 text-slate-300"
                                aria-hidden
                                fill="none"
                              >
                                <rect x="10" y="12" width="44" height="40" rx="8" stroke="currentColor" strokeWidth="2" />
                                <path
                                  d="M18 42l10-12 9 7 9-13"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <circle cx="28" cy="30" r="2.5" fill="currentColor" />
                                <circle cx="37" cy="37" r="2.5" fill="currentColor" />
                                <circle cx="46" cy="24" r="2.5" fill="currentColor" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <time
                            dateTime={post.published_at}
                            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400"
                          >
                            {formatArticleDate(post.published_at, locale)}
                          </time>
                          <h3 className="mt-3 text-base font-semibold leading-snug text-slate-900 transition group-hover:text-[#2563EB]">
                            {title}
                          </h3>
                          {excerpt ? (
                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
                              {excerpt}
                            </p>
                          ) : null}
                          <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#2563EB]">
                            {t.readArticle}
                            <svg
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
                              aria-hidden
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 10a.75.75 0 0 1 .75-.75h7.69l-2.22-2.22a.75.75 0 1 1 1.06-1.06l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 1 1-1.06-1.06l2.22-2.22H4.75A.75.75 0 0 1 4 10Z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </PublicPageMain>
    </div>
  );
}
