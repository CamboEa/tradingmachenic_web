"use client";

import { DeleteBlogButton } from "@/components/blog/delete-blog-button";
import {
  AdminTable,
  Badge,
  EditLink,
  RowActions,
  TableThumb,
  type Column,
  type Filter,
} from "@/components/ui";
import type { BlogPost } from "@/lib/supabase/blog";

/** Local copy of the pure check so this client module never pulls in server-only code. */
function blogHasKhmerTranslation(post: Pick<BlogPost, "title_km" | "body_km">): boolean {
  return post.title_km.trim().length > 0 && post.body_km.trim().length > 0;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const columns: Column<BlogPost>[] = [
  {
    header: "Article",
    cell: (post) => (
      <div className="flex items-center gap-3">
        <TableThumb src={post.featured_image_url} alt={post.title_en} className="h-12 w-16" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-brand">{post.title_en}</p>
          <p className="truncate font-mono text-xs text-slate-400">/blog/{post.slug}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Status",
    cell: (post) => (
      <Badge variant={post.status === "published" ? "published" : "draft"}>
        {post.status === "published" ? "Published" : "Draft"}
      </Badge>
    ),
  },
  {
    header: "Translation",
    cell: (post) =>
      blogHasKhmerTranslation(post) ? (
        <Badge variant="teal">EN · KM</Badge>
      ) : (
        <Badge variant="warning">Khmer pending</Badge>
      ),
  },
  {
    header: "Published",
    className: "whitespace-nowrap",
    cell: (post) => <span className="text-ink-soft">{formatDate(post.published_at)}</span>,
  },
  {
    header: "Actions",
    align: "right",
    cell: (post) => (
      <RowActions>
        <EditLink href={`/admin/blog/edit/${post.id}`} />
        <DeleteBlogButton id={post.id} slug={post.slug} title={post.title_en} />
      </RowActions>
    ),
  },
];

const filter: Filter<BlogPost> = {
  allLabel: "All articles",
  groups: [
    {
      label: "Status",
      options: [
        { label: "Published", value: "status:published", predicate: (p) => p.status === "published" },
        { label: "Draft", value: "status:draft", predicate: (p) => p.status === "draft" },
      ],
    },
    {
      label: "Translation",
      options: [
        {
          label: "Translated (EN · KM)",
          value: "tr:translated",
          predicate: (p) => blogHasKhmerTranslation(p),
        },
        {
          label: "Khmer pending",
          value: "tr:pending",
          predicate: (p) => !blogHasKhmerTranslation(p),
        },
      ],
    },
  ],
};

export function BlogTable({ posts }: { posts: BlogPost[] }) {
  return (
    <AdminTable
      data={posts}
      getKey={(post) => post.id}
      columns={columns}
      filter={filter}
      searchPlaceholder="Search articles by title…"
      searchText={(post) => `${post.title_en} ${post.slug} ${post.excerpt_en ?? ""}`}
    />
  );
}
