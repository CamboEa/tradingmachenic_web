import { notFound, redirect } from "next/navigation";

import { ToolsForm } from "@/components/tools/tools-form";
import { AdminFormHeader, Badge } from "@/components/ui";
import { getStaffAccess, toolScopeError } from "@/lib/auth/staff-access";
import { getToolForEdit } from "@/lib/supabase/actions";

export const metadata = { title: "Edit Tool" };

export default async function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const access = await getStaffAccess();
  if (!access) notFound();

  const tool = await getToolForEdit(id);

  if (!tool) notFound();

  const scopeErr = toolScopeError(access, tool);
  if (scopeErr) {
    if (access.role === "mentor") {
      redirect("/admin/tools");
    }
    notFound();
  }

  return (
    <div>
      <AdminFormHeader
        backHref="/admin/tools"
        title="Edit Tool"
        description={tool.name}
        meta={
          <>
            <span className="text-xs text-ink-soft">v{tool.version}</span>
            <Badge variant={tool.status === "published" ? "published" : "draft"}>
              {tool.status === "published" ? "Published" : "Draft"}
            </Badge>
            <Badge variant={tool.pricing === "free" ? "teal" : "warning"}>
              {tool.pricing === "free" ? "Free" : "Paid"}
            </Badge>
            <Badge variant="neutral">{tool.platform}</Badge>
            <Badge variant="neutral">
              {tool.type === "indicator" ? "Indicator" : "Expert Advisor"}
            </Badge>
          </>
        }
      />

      <ToolsForm tool={tool} />
    </div>
  );
}
