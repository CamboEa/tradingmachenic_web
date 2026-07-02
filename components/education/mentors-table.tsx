"use client";

import { DeleteMentorButton } from "@/components/education/delete-mentor-button";
import {
  AdminTable,
  Badge,
  EditLink,
  RowActions,
  TableThumb,
  type Column,
  type Filter,
} from "@/components/ui";
import type { AdminMentor } from "@/lib/supabase/mentors";

const columns: Column<AdminMentor>[] = [
  {
    header: "Mentor",
    cell: (mentor) => (
      <div className="flex items-center gap-3">
        <TableThumb
          src={mentor.imageUrl || null}
          alt={mentor.names.en}
          className="h-12 w-12 rounded-full"
        />
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{mentor.names.en}</p>
          <p className="mt-0.5 truncate text-xs text-ink-soft">{mentor.titles.en || mentor.slug}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Categories",
    cell: (mentor) => (
      <div className="flex flex-wrap gap-1">
        {mentor.categories.map((category) => (
          <span
            key={category}
            className="rounded-md bg-surface-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-muted"
          >
            {category}
          </span>
        ))}
      </div>
    ),
  },
  {
    header: "Status",
    cell: (mentor) => (
      <Badge variant={mentor.status === "published" ? "published" : "draft"}>
        {mentor.status === "published" ? "Published" : "Draft"}
      </Badge>
    ),
  },
  {
    header: "Actions",
    align: "right",
    cell: (mentor) => (
      <RowActions>
        <EditLink href={`/admin/mentors/edit/${encodeURIComponent(mentor.slug)}`} />
        <DeleteMentorButton slug={mentor.slug} name={mentor.names.en} />
      </RowActions>
    ),
  },
];

const filter: Filter<AdminMentor> = {
  allLabel: "All statuses",
  groups: [
    {
      options: [
        {
          label: "Published",
          value: "status:published",
          predicate: (mentor) => mentor.status === "published",
        },
        {
          label: "Draft",
          value: "status:draft",
          predicate: (mentor) => mentor.status === "draft",
        },
      ],
    },
  ],
};

export function MentorsTable({ mentors }: { mentors: AdminMentor[] }) {
  return (
    <AdminTable
      data={mentors}
      getKey={(mentor) => mentor.id}
      columns={columns}
      filter={filter}
      rowHref={(mentor) => `/admin/mentors/edit/${encodeURIComponent(mentor.slug)}`}
      searchPlaceholder="Search mentors by name or strategy…"
      searchText={(mentor) =>
        `${mentor.names.en} ${mentor.names.km} ${mentor.titles.en} ${mentor.titles.km} ${mentor.bios.en} ${mentor.slug}`
      }
    />
  );
}
