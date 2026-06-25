import { LessonForm } from "@/components/education/lesson-form";
import { AdminFormHeader } from "@/components/ui";
import { adminLessonsListHref } from "@/lib/admin-lessons-nav";
import { isEducationCategory } from "@/lib/education-categories";
import { getAllLessonTopicsForAdmin } from "@/lib/supabase/lesson-topics";
import { getAllMentorsForAdmin } from "@/lib/supabase/mentors";

export const metadata = { title: "Add Lesson" };

export default async function AddLessonPage({
  searchParams,
}: {
  searchParams: Promise<{ mentor?: string; category?: string; topic?: string }>;
}) {
  const [mentors, lessonTopics] = await Promise.all([
    getAllMentorsForAdmin(),
    getAllLessonTopicsForAdmin(),
  ]);
  const params = await searchParams;
  const mentorParam = params.mentor?.trim() ?? "";
  const categoryParam = params.category?.trim() ?? "";
  const topicParam = params.topic?.trim() ?? "";

  const defaultMentorSlug = mentors.some((mentor) => mentor.slug === mentorParam)
    ? mentorParam
    : "";

  const matchedMentor = mentors.find((mentor) => mentor.slug === defaultMentorSlug);
  const defaultCategory = isEducationCategory(categoryParam)
    ? categoryParam
    : matchedMentor?.categories[0] ?? "";

  const defaultTopicSlug =
    lessonTopics.some(
      (topic) => topic.mentorSlug === defaultMentorSlug && topic.slug === topicParam,
    )
      ? topicParam
      : "";

  const backHref = adminLessonsListHref(
    defaultMentorSlug || undefined,
    defaultTopicSlug || undefined,
  );

  return (
    <div>
      <AdminFormHeader
        backHref={backHref}
        backLabel="Lessons"
        title="Add New Lesson"
        description="Follow the five steps to create a video lesson for your curriculum."
      />

      <LessonForm
        mentors={mentors}
        lessonTopics={lessonTopics}
        defaultMentorSlug={defaultMentorSlug}
        defaultCategory={defaultCategory}
        defaultTopicSlug={defaultTopicSlug}
      />
    </div>
  );
}
