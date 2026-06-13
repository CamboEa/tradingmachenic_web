import { ToolsTable } from "@/components/tools/tools-table";
import { AdminPageHeader, ButtonLink, EmptyState } from "@/components/ui";
import { getAllTools } from "@/lib/supabase/tools";

export const metadata = { title: "Tools" };

export default async function ToolsPage() {
  const tools = await getAllTools();

  return (
    <div>
      <AdminPageHeader
        title="Tools"
        description="Publish indicators and expert advisors for your students."
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
