import Link from "next/link";

import { BlogForm } from "@/components/blog/blog-form";

export const metadata = { title: "New blog article" };

export default function AddBlogPage() {
  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Link
          href="/admin/blog"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#22332E]">New article</h1>
          <p className="mt-1 text-sm text-slate-500">
            Write the article in English first. You can add the Khmer translation later when you
            edit the post.
          </p>
        </div>
      </div>
      <BlogForm />
    </div>
  );
}
