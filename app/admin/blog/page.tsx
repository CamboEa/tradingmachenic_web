import { BlogTable } from "@/components/blog/blog-table";
import { AdminPageHeader, ButtonLink, EmptyState } from "@/components/ui";
import { getAllBlogPosts } from "@/lib/supabase/blog";

export const metadata = { title: "Blog" };

export default async function AdminBlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div>
      <AdminPageHeader
        title="Lesson blog"
        description="Write articles in English first, then add Khmer when you edit. Published posts appear on the public blog."
        action={<ButtonLink href="/admin/blog/add">+ New article</ButtonLink>}
      />

      {posts.length === 0 ? (
        <EmptyState
          title="No articles yet"
          description="Start with an English article; add the Khmer translation later from Edit."
          action={{ href: "/admin/blog/add", label: "+ New article" }}
        />
      ) : (
        <BlogTable posts={posts} />
      )}
    </div>
  );
}
