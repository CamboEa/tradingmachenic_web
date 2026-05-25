import { DeleteBlogButton } from "@/components/blog/delete-blog-button";
import {
  AdminPageHeader,
  Badge,
  ButtonLink,
  Card,
  EmptyState,
} from "@/components/ui";
import { blogHasKhmerTranslation, getAllBlogPosts } from "@/lib/supabase/blog";
import { cn } from "@/lib/ui/cn";

export const metadata = { title: "Blog" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function NoImagePlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex aspect-[16/10] w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 sm:w-48",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="h-8 w-8 text-slate-300"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
        />
      </svg>
      <span className="text-xs text-slate-400">No image</span>
    </div>
  );
}

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
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} padding={false} className="overflow-hidden">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
                {post.featured_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.featured_image_url}
                    alt=""
                    className="aspect-[16/10] w-full shrink-0 rounded-lg border border-slate-100 object-cover sm:w-48"
                  />
                ) : (
                  <NoImagePlaceholder />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-brand">{post.title_en}</h2>
                    <Badge variant={post.status === "published" ? "published" : "draft"}>
                      {post.status === "published" ? "Published" : "Draft"}
                    </Badge>
                    {!blogHasKhmerTranslation(post) ? (
                      <Badge variant="warning">Khmer pending</Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 font-mono text-xs text-slate-400">/blog/{post.slug}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(post.published_at)}</p>
                  {post.excerpt_en ? (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">{post.excerpt_en}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 gap-2 sm:flex-col sm:items-stretch">
                  <ButtonLink
                    href={`/admin/blog/edit/${post.id}`}
                    variant="secondary"
                    className="px-3 py-2 text-xs"
                  >
                    Edit
                  </ButtonLink>
                  <DeleteBlogButton id={post.id} slug={post.slug} title={post.title_en} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
