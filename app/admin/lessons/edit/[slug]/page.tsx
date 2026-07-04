import { notFound, redirect } from "next/navigation";

import { LessonForm } from "@/components/education/lesson-form";
import { AdminFormHeader } from "@/components/ui";
import { getStaffAccess, mentorScopeError } from "@/lib/auth/staff-access";
import { mentorLessonsHref } from "@/lib/education/admin-lessons-nav";
import { getLessonForEdit } from "@/lib/supabase/actions";
import { getAllLessonTopicsForAdmin } from "@/lib/supabase/lesson-topics";
import { getAllMentorsForAdmin } from "@/lib/supabase/mentors";

export const metadata = { title: "Edit Lesson" };

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const access = await getStaffAccess();
  if (!access) notFound();

  const mentorScope = access.role === "mentor" ? access.mentorSlug : undefined;
  const [data, mentors, lessonTopics] = await Promise.all([
    getLessonForEdit(slug),
    access.role === "admin" ? getAllMentorsForAdmin() : Promise.resolve([]),
    getAllLessonTopicsForAdmin(mentorScope),
  ]);

  if (!data) {
    notFound();
  }

  const { lesson, videos } = data;
  const mentorSlug = lesson.mentor_slug?.trim() || undefined;
  const topicSlug = lesson.lesson_topic_slug?.trim() || undefined;

  const scopeErr = mentorScopeError(access, mentorSlug ?? "");
  if (scopeErr) {
    if (access.role === "mentor") {
      redirect(`/admin/mentors/edit/${access.mentorSlug}?tab=lessons`);
    }
    notFound();
  }

  return (
    <div>
      <AdminFormHeader
        backHref={mentorLessonsHref(mentorSlug, topicSlug)}
        backLabel="Lessons"
        title="Edit Lesson"
        description={lesson.title_en}
      />

      <LessonForm
        initialData={{ lesson, videos }}
        isEditing
        mentors={mentors}
        lessonTopics={lessonTopics}
      />
    </div>
  );
}
