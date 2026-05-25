import Link from "next/link";

import { DeleteBlogButton } from "@/components/blog/delete-blog-button";
import { blogHasKhmerTranslation, getAllBlogPosts } from "@/lib/supabase/blog";

export const metadata = { title: "Blog" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminBlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Lesson blog</h1>
          <p className="mt-1 text-sm text-slate-500">
            Write articles in English first, then add Khmer when you edit. Published posts appear on
            the public blog.
          </p>
        </div>
        <Link
          href="/admin/blog/add"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
        >
          + New article
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-500">No articles yet</p>
          <p className="mt-1.5 text-sm text-slate-400">
            Start with an English article; add the Khmer translation later from Edit.
          </p>
          <Link
            href="/admin/blog/add"
            className="mt-6 inline-flex rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-600"
          >
            + New article
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                {post.featured_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.featured_image_url}
                    alt=""
                    className="aspect-[16/10] w-full shrink-0 rounded-lg border border-slate-100 object-cover sm:w-48"
                  />
                ) : (
                  <div className="flex aspect-[16/10] w-full items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-2xl text-slate-300 sm:w-48">
                    📰
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-[#1e293b]">{post.title_en}</h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                    {!blogHasKhmerTranslation(post) ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        Khmer pending
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 font-mono text-xs text-slate-400">/blog/{post.slug}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(post.published_at)}</p>
                  {post.excerpt_en ? (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{post.excerpt_en}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2 sm:flex-col sm:items-stretch">
                  <Link
                    href={`/admin/blog/edit/${post.id}`}
                    className="rounded-md border border-slate-200 px-3 py-2 text-center text-xs font-medium text-slate-600 hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
                  >
                    Edit
                  </Link>
                  <DeleteBlogButton id={post.id} slug={post.slug} title={post.title_en} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
