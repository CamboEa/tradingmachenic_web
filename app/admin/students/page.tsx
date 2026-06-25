import { AdminPageHeader, Card, StatCard } from "@/components/ui";
import { UsersTable } from "@/components/users/users-table";
import { BRAND_NAME } from "@/lib/brand";
import { getAllProfiles } from "@/lib/supabase/profiles";
import { getSessionUser } from "@/lib/supabase/server";

export const metadata = { title: "Users" };

export default async function UsersPage() {
  const [users, sessionUser] = await Promise.all([getAllProfiles(), getSessionUser()]);

  const admins = users.filter((u) => u.role === "admin").length;
  const students = users.length - admins;

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description={`Everyone registered on ${BRAND_NAME}. Promote students to admins or revoke access.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total users" value={users.length} accent="teal" />
        <StatCard label="Students" value={students} accent="slate" />
        <StatCard label="Admins" value={admins} accent="gold" />
      </div>

      <div className="mt-8">
        {users.length === 0 ? (
          <Card className="px-8 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-soft">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-7 w-7 text-slate-400"
                aria-hidden
              >
                <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 0 1 7 17a9.953 9.953 0 0 1-5.385-1.572ZM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 0 0-1.588-3.755 4.502 4.502 0 0 1 5.874 2.636.818.818 0 0 1-.36.98A7.465 7.465 0 0 1 14.5 16Z" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-brand">No users yet</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
              Registered users will appear here once people sign up.
            </p>
          </Card>
        ) : (
          <UsersTable users={users} currentUserId={sessionUser?.id} />
        )}
      </div>
    </div>
  );
}
