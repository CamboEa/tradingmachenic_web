import { notFound } from "next/navigation";

import { BlogForm } from "@/components/blog/blog-form";
import { AdminFormHeader } from "@/components/ui";
import { getBlogForEdit } from "@/lib/supabase/actions";

export const metadata = { title: "Edit blog article" };

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getBlogForEdit(id);
  if (!post) notFound();

  return (
    <div>
      <AdminFormHeader
        backHref="/admin/blog"
        title="Edit article"
        description={post.title_en}
      />

      <BlogForm post={post} />
    </div>
  );
}
