import { BlogForm } from "@/components/blog/blog-form";
import { AdminFormHeader } from "@/components/ui";

export const metadata = { title: "New blog article" };

export default function AddBlogPage() {
  return (
    <div>
      <AdminFormHeader
        backHref="/admin/blog"
        title="New article"
        description="Write the article in English first. You can add the Khmer translation later when you edit the post."
      />

      <BlogForm />
    </div>
  );
}
