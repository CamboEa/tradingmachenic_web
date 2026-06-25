import { MentorsTable } from "@/components/education/mentors-table";
import { AdminPageHeader, ButtonLink, EmptyState } from "@/components/ui";
import { getAllMentorsForAdmin } from "@/lib/supabase/mentors";

export const metadata = { title: "Mentors" };

export default async function MentorsPage() {
  const mentors = await getAllMentorsForAdmin();

  return (
    <div>
      <AdminPageHeader
        title="Mentors"
        description="Create mentor profiles, assign market categories, then add lessons for each mentor."
        action={<ButtonLink href="/admin/mentors/add">+ Add Mentor</ButtonLink>}
      />

      {mentors.length === 0 ? (
        <EmptyState
          title="No mentors yet"
          description="Create a mentor profile first, then add lessons from the Lessons section."
          action={{ href: "/admin/mentors/add", label: "+ Add Mentor" }}
        />
      ) : (
        <MentorsTable mentors={mentors} />
      )}
    </div>
  );
}
