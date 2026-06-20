import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogForm } from "@/components/blog/blog-form";
import { getBlogForEdit } from "@/lib/supabase/actions";

export const metadata = { title: "Edit blog article" };

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getBlogForEdit(id);
  if (!post) notFound();

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Link
          href="/admin/blog"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          ← Back
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[#0D1B33]">Edit article</h1>
          <p className="mt-1 truncate text-sm text-slate-500">{post.title_en}</p>
        </div>
      </div>
      <BlogForm post={post} />
    </div>
  );
}
