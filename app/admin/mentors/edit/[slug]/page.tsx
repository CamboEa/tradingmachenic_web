import { notFound } from "next/navigation";

import { MentorForm } from "@/components/education/mentor-form";
import { AdminFormHeader, Badge } from "@/components/ui";
import { getMentorForAdminBySlug } from "@/lib/supabase/mentors";

export const metadata = { title: "Edit mentor" };

export default async function EditMentorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mentor = await getMentorForAdminBySlug(slug);
  if (!mentor) notFound();

  return (
    <div>
      <AdminFormHeader
        backHref="/admin/mentors"
        title="Edit mentor"
        description={mentor.names.en}
        meta={
          <Badge variant={mentor.status === "published" ? "published" : "draft"}>
            {mentor.status === "published" ? "Published" : "Draft"}
          </Badge>
        }
      />

      <MentorForm mentor={mentor} />
    </div>
  );
}
