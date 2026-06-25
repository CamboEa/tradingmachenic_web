import { AdminPageHeader, EmptyState, StatCard } from "@/components/ui";
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
          <EmptyState
            title="No users yet"
            description="Registered users will appear here once people sign up."
          />
        ) : (
          <UsersTable users={users} currentUserId={sessionUser?.id} />
        )}
      </div>
    </div>
  );
}
