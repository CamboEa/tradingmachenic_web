import { ToolsTable } from "@/components/tools/tools-table";
import { AdminPageHeader, ButtonLink, EmptyState } from "@/components/ui";
import { getStaffAccess } from "@/lib/auth/staff-access";
import { getAllTools } from "@/lib/supabase/tools";

export const metadata = { title: "Tools" };

export default async function ToolsPage() {
  const access = await getStaffAccess();
  const mentorSlug = access?.role === "mentor" ? access.mentorSlug : undefined;
  const tools = await getAllTools(mentorSlug);
  const isMentor = access?.role === "mentor";

  return (
    <div>
      <AdminPageHeader
        title="Tools"
        description={
          isMentor
            ? "Publish indicators and expert advisors for your students."
            : "Publish indicators and expert advisors for your students."
        }
        action={<ButtonLink href="/admin/tools/add">+ Add Tool</ButtonLink>}
      />

      {tools.length === 0 ? (
        <EmptyState
          title="No tools yet"
          description="Add your first indicator or expert advisor to show it on the public tools page."
          action={{ href: "/admin/tools/add", label: "+ Add Tool" }}
        />
      ) : (
        <ToolsTable tools={tools} />
      )}
    </div>
  );
}
