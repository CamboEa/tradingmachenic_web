import { notFound } from "next/navigation";

import { LessonTopicForm } from "@/components/education/lesson-topic-form";
import { AdminFormHeader } from "@/components/ui";
import { adminLessonTopicsHref } from "@/lib/education/admin-lessons-nav";
import { getAllMentorsForAdmin } from "@/lib/supabase/mentors";

export const metadata = { title: "Add topic" };

export default async function AddLessonTopicPage({
  searchParams,
}: {
  searchParams: Promise<{ mentor?: string }>;
}) {
  const { mentor: mentorParam } = await searchParams;
  const mentorSlug = mentorParam?.trim() ?? "";
  if (!mentorSlug) notFound();

  const mentors = await getAllMentorsForAdmin();
  const mentor = mentors.find((item) => item.slug === mentorSlug);
  if (!mentor) notFound();

  return (
    <div>
      <AdminFormHeader
        backHref={adminLessonTopicsHref(mentor.slug)}
        backLabel="Topics"
        title="Add topic"
        description={`Create a new topic for ${mentor.names.en}.`}
      />

      <LessonTopicForm mentorSlug={mentor.slug} mentorName={mentor.names.en} />
    </div>
  );
}
