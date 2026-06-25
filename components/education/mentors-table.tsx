"use client";

import Link from "next/link";

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
          <p className="truncate font-semibold text-slate-brand">{mentor.names.en}</p>
          <p className="mt-0.5 truncate text-xs text-slate-400">{mentor.titles.en || mentor.slug}</p>
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
    header: "Order",
    align: "center",
    className: "tabular-nums",
    cell: (mentor) => <span className="text-ink-soft">{mentor.sortOrder}</span>,
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
        <Link
          href={`/admin/lessons/add?mentor=${encodeURIComponent(mentor.slug)}`}
          className="rounded-lg border border-bridge/40 px-2.5 py-1.5 text-xs font-semibold text-teal transition hover:bg-surface-soft"
          title="Add lesson for this mentor"
        >
          + Lesson
        </Link>
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
      searchPlaceholder="Search mentors by name or strategy…"
      searchText={(mentor) =>
        `${mentor.names.en} ${mentor.names.km} ${mentor.titles.en} ${mentor.titles.km} ${mentor.bios.en} ${mentor.slug}`
      }
    />
  );
}
