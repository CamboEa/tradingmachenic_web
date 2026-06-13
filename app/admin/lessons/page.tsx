import { LessonsList } from "@/components/education/lessons-list";
import { AdminPageHeader, ButtonLink, EmptyState } from "@/components/ui";
import { getAllLessonsForAdmin } from "@/lib/supabase/lessons";

export const metadata = { title: "Lessons" };

export default async function LessonsPage() {
  const lessons = await getAllLessonsForAdmin();

  return (
    <div>
      <AdminPageHeader
        title="Lessons"
        description="Manage your video lesson library."
        action={<ButtonLink href="/admin/lessons/add">+ Add Lesson</ButtonLink>}
      />

      {lessons.length === 0 ? (
        <EmptyState
          title="No lessons yet"
          description="Add your first video lesson to build out the library."
          action={{ href: "/admin/lessons/add", label: "+ Add Lesson" }}
        />
      ) : (
        <LessonsList lessons={lessons} />
      )}
    </div>
  );
}
