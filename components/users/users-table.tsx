"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import {
  AdminTable,
  Badge,
  type Column,
  type Filter,
} from "@/components/ui";
import { updateUserRole } from "@/lib/supabase/actions";
import type { Profile, UserRole } from "@/lib/supabase/profiles";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function initials(profile: Profile): string {
  const source = profile.full_name?.trim() || profile.email?.trim() || "?";
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function RoleSelect({ user, isSelf }: { user: Profile; isSelf: boolean }) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: UserRole) {
    const previous = role;
    setRole(next);
    setSaving(true);
    const { error } = await updateUserRole(user.id, next);
    setSaving(false);
    if (error) {
      setRole(previous);
      toast.error(error);
      return;
    }
    toast.success(`Role updated to ${next}`);
  }

  if (isSelf) {
    return (
      <Badge variant={role === "admin" ? "gold" : "neutral"}>
        {role === "admin" ? "Admin" : "Student"} (you)
      </Badge>
    );
  }

  return (
    <select
      value={role}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value as UserRole)}
      aria-label={`Role for ${user.email ?? user.id}`}
      className="cursor-pointer rounded-lg border border-bridge/40 bg-surface px-2.5 py-1.5 text-xs font-semibold text-ink-muted outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <option value="student">Student</option>
      <option value="admin">Admin</option>
    </select>
  );
}

export function UsersTable({
  users,
  currentUserId,
}: {
  users: Profile[];
  currentUserId?: string;
}) {
  const columns: Column<Profile>[] = [
    {
      header: "User",
      cell: (user) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-soft text-xs font-bold text-ink-muted">
            {initials(user)}
          </span>
          <div className="min-w-0">
            <div className="truncate font-semibold text-slate-brand">
              {user.full_name?.trim() || "—"}
            </div>
            <div className="truncate text-xs text-slate-400">{user.email ?? "No email"}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      cell: (user) => <RoleSelect user={user} isSelf={user.id === currentUserId} />,
    },
    {
      header: "Joined",
      cell: (user) => (
        <span className="whitespace-nowrap text-sm text-ink-soft">
          {formatDate(user.created_at)}
        </span>
      ),
    },
  ];

  const filter: Filter<Profile> = {
    allLabel: "All users",
    groups: [
      {
        label: "Role",
        options: [
          { label: "Admins", value: "role:admin", predicate: (u) => u.role === "admin" },
          { label: "Students", value: "role:student", predicate: (u) => u.role === "student" },
        ],
      },
    ],
  };

  return (
    <AdminTable
      data={users}
      getKey={(user) => user.id}
      columns={columns}
      filter={filter}
      searchPlaceholder="Search by name or email…"
      searchText={(user) => `${user.full_name ?? ""} ${user.email ?? ""}`}
    />
  );
}
