import { notFound } from "next/navigation";

import { LessonForm } from "@/components/education/lesson-form";
import { AdminFormHeader } from "@/components/ui";
import { adminLessonsListHref } from "@/lib/education/admin-lessons-nav";
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
  const [data, mentors, lessonTopics] = await Promise.all([
    getLessonForEdit(slug),
    getAllMentorsForAdmin(),
    getAllLessonTopicsForAdmin(),
  ]);

  if (!data) {
    notFound();
  }

  const { lesson, videos } = data;
  const mentorSlug = lesson.mentor_slug?.trim() || undefined;
  const topicSlug = lesson.lesson_topic_slug?.trim() || undefined;

  return (
    <div>
      <AdminFormHeader
        backHref={adminLessonsListHref(mentorSlug, topicSlug)}
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
