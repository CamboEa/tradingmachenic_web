import { LessonsList } from "@/components/education/lessons-list";
import { AdminPageHeader, ButtonLink } from "@/components/ui";
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

      <LessonsList lessons={lessons} />
    </div>
  );
}
