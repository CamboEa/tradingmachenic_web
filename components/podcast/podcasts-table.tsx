"use client";

import { DeletePodcastButton } from "@/components/podcast/delete-podcast-button";
import {
  AdminTable,
  Badge,
  EditLink,
  RowActions,
  TableThumb,
  type Column,
  type Filter,
} from "@/components/ui";
import type { Podcast } from "@/lib/supabase/podcasts";
import { extractYouTubeVideoId, youtubeThumbnailUrl } from "@/lib/media/youtube";

const columns: Column<Podcast>[] = [
  {
    header: "Episode",
    cell: (ep) => {
      const vid = extractYouTubeVideoId(ep.youtube_url);
      const thumb = vid ? youtubeThumbnailUrl(vid) : null;
      return (
        <div className="flex items-center gap-3">
          <TableThumb src={thumb} alt={ep.title_en} className="h-12 w-20" />
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{ep.title_en}</p>
            {ep.description_en ? (
              <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-ink-soft">
                {ep.description_en}
              </p>
            ) : null}
          </div>
        </div>
      );
    },
  },
  {
    header: "Source",
    cell: (ep) => (
      <a
        href={ep.youtube_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex max-w-[16rem] items-center gap-1.5 truncate font-mono text-xs text-teal hover:underline"
        title={ep.youtube_url}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0">
          <path d="M11 3a1 1 0 1 0 0 2h2.586l-6.293 6.293a1 1 0 1 0 1.414 1.414L15 6.414V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5Z" />
          <path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5Z" />
        </svg>
        <span className="truncate">{ep.youtube_url}</span>
      </a>
    ),
  },
  {
    header: "Order",
    align: "center",
    className: "tabular-nums",
    cell: (ep) => <span className="text-ink-soft">{ep.sort_order}</span>,
  },
  {
    header: "Status",
    cell: (ep) => (
      <Badge variant={ep.status === "published" ? "published" : "draft"}>
        {ep.status === "published" ? "Published" : "Draft"}
      </Badge>
    ),
  },
  {
    header: "Actions",
    align: "right",
    cell: (ep) => (
      <RowActions>
        <EditLink href={`/admin/podcasts/edit/${ep.id}`} />
        <DeletePodcastButton id={ep.id} title={ep.title_en} />
      </RowActions>
    ),
  },
];

const filter: Filter<Podcast> = {
  allLabel: "All statuses",
  groups: [
    {
      options: [
        { label: "Published", value: "status:published", predicate: (ep) => ep.status === "published" },
        { label: "Draft", value: "status:draft", predicate: (ep) => ep.status === "draft" },
      ],
    },
  ],
};

export function PodcastsTable({ episodes }: { episodes: Podcast[] }) {
  return (
    <AdminTable
      data={episodes}
      getKey={(ep) => ep.id}
      columns={columns}
      filter={filter}
      searchPlaceholder="Search episodes by title…"
      searchText={(ep) => `${ep.title_en} ${ep.description_en ?? ""} ${ep.youtube_url}`}
    />
  );
}
