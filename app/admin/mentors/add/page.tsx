import { MentorForm } from "@/components/education/mentor-form";
import { AdminFormHeader } from "@/components/ui";

export const metadata = { title: "Add mentor" };

export default function AddMentorPage() {
  return (
    <div>
      <AdminFormHeader
        backHref="/admin/mentors"
        title="Add mentor"
        description="Create a mentor profile for the education hub."
      />

      <MentorForm />
    </div>
  );
}
