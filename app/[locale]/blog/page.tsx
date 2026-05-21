import Link from "next/link";
import { notFound } from "next/navigation";

import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getPublishedBlogPosts } from "@/lib/supabase/blog";

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

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-[#1e293b] px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(212,175,55,0.18),transparent_24rem),radial-gradient(circle_at_86%_10%,rgba(14,165,233,0.2),transparent_26rem)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d4af37]">{t.eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {t.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{t.intro}</p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-[#d4af37]/25 bg-[#d4af37]/5 px-8 py-14 text-center">
            <p className="text-xl font-bold text-[#1e293b]">{t.emptyTitle}</p>
            <p className="mx-auto mt-3 max-w-lg text-slate-500">{t.emptyBody}</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const title = locale === "km" ? post.title_km : post.title_en;
              const excerpt = locale === "km" ? post.excerpt_km : post.excerpt_en;

              return (
                <Link
                  key={post.id}
                  href={`/${locale}/blog/${post.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[color-mix(in_oklab,#0ea5e9_28%,#cbd5e1)] hover:shadow-md"
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.75 bg-linear-to-r from-[#d4af37] via-[#d4af37]/60 to-transparent"
                    aria-hidden
                  />
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {post.featured_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.featured_image_url}
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 via-white to-sky-50 text-4xl text-slate-300">
                        📰
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <time
                      dateTime={post.published_at}
                      className="text-xs font-semibold uppercase tracking-wider text-[#0ea5e9]"
                    >
                      {formatArticleDate(post.published_at, locale)}
                    </time>
                    <h2 className="mt-3 text-lg font-bold leading-snug text-[#1e293b] transition group-hover:text-[#0ea5e9]">
                      {title}
                    </h2>
                    {excerpt ? (
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">
                        {excerpt}
                      </p>
                    ) : null}
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#0ea5e9]">
                      {t.readArticle}
                      <span aria-hidden className="transition group-hover:translate-x-0.5">
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
