"use client";

import Link from "next/link";

import {
  AdminTable,
  Badge,
  RowActions,
  TableThumb,
  type Column,
  type Filter,
} from "@/components/ui";
import type { AdminMentor } from "@/lib/supabase/mentors";
import type { Profile } from "@/lib/supabase/profiles";

export type MentorWithAccount = AdminMentor & {
  linkedProfile: Profile | null;
};

const columns: Column<MentorWithAccount>[] = [
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
          <p className="mt-0.5 truncate text-xs text-ink-soft">{mentor.slug}</p>
        </div>
      </div>
    ),
  },
  {
    header: "Login email",
    cell: (mentor) => (
      <span className="text-sm text-ink-muted">
        {mentor.linkedProfile?.email ?? "—"}
      </span>
    ),
  },
  {
    header: "Access",
    cell: (mentor) =>
      mentor.linkedProfile ? (
        <Badge variant="teal">Active</Badge>
      ) : (
        <Badge variant="neutral">No account</Badge>
      ),
  },
  {
    header: "Actions",
    align: "right",
    cell: (mentor) => (
      <RowActions>
        <Link
          href={`/admin/mentor-accounts/${encodeURIComponent(mentor.slug)}`}
          className="text-xs font-semibold text-teal hover:underline"
        >
          {mentor.linkedProfile ? "Manage" : "Set up login"}
        </Link>
      </RowActions>
    ),
  },
];

const filter: Filter<MentorWithAccount> = {
  allLabel: "All mentors",
  groups: [
    {
      options: [
        {
          label: "Has login",
          value: "access:active",
          predicate: (mentor) => !!mentor.linkedProfile,
        },
        {
          label: "No login",
          value: "access:none",
          predicate: (mentor) => !mentor.linkedProfile,
        },
      ],
    },
  ],
};

export function MentorAccountsTable({ mentors }: { mentors: MentorWithAccount[] }) {
  return (
    <AdminTable
      data={mentors}
      getKey={(mentor) => mentor.id}
      columns={columns}
      filter={filter}
      rowHref={(mentor) => `/admin/mentor-accounts/${encodeURIComponent(mentor.slug)}`}
      searchPlaceholder="Search mentors by name or slug…"
      searchText={(mentor) =>
        `${mentor.names.en} ${mentor.names.km} ${mentor.slug} ${mentor.linkedProfile?.email ?? ""}`
      }
    />
  );
}
