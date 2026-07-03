import { notFound } from "next/navigation";

import { LessonTopicForm } from "@/components/education/lesson-topic-form";
import { AdminFormHeader } from "@/components/ui";
import { adminLessonTopicsHref } from "@/lib/education/admin-lessons-nav";
import { getLessonTopicForEdit } from "@/lib/supabase/lesson-topics";
import { getAllMentorsForAdmin } from "@/lib/supabase/mentors";

export const metadata = { title: "Edit topic" };

export default async function EditLessonTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [topic, mentors] = await Promise.all([
    getLessonTopicForEdit(id),
    getAllMentorsForAdmin(),
  ]);

  if (!topic) notFound();

  const mentor = mentors.find((item) => item.slug === topic.mentorSlug);
  if (!mentor) notFound();

  return (
    <div>
      <AdminFormHeader
        backHref={adminLessonTopicsHref(mentor.slug)}
        backLabel="Topics"
        title="Edit topic"
        description={topic.names.en}
      />

      <LessonTopicForm topic={topic} mentorSlug={mentor.slug} mentorName={mentor.names.en} />
    </div>
  );
}
