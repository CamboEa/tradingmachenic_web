import { ToolsForm } from "@/components/tools/tools-form";
import { AdminFormHeader } from "@/components/ui";

export const metadata = { title: "Add Tool" };

export default function AddToolPage() {
  return (
    <div>
      <AdminFormHeader
        backHref="/admin/tools"
        title="Add New Tool"
        description="Follow the five steps to add an indicator or expert advisor."
      />

      <ToolsForm />
    </div>
  );
}
