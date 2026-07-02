import { notFound, redirect } from "next/navigation";

import { LessonTopicsTable } from "@/components/education/lesson-topics-table";
import { AdminBackLink, AdminPageHeader, ButtonLink, EmptyState } from "@/components/ui";
import { adminLessonsListHref } from "@/lib/admin-lessons-nav";
import { getAllLessonTopicsForAdmin, topicsForMentor } from "@/lib/supabase/lesson-topics";
import { getAllMentorsForAdmin } from "@/lib/supabase/mentors";

export const metadata = { title: "Lesson topics" };

export default async function LessonTopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ mentor?: string }>;
}) {
  const { mentor: mentorParam } = await searchParams;
  const mentorSlug = mentorParam?.trim() ?? "";

  if (!mentorSlug) {
    redirect("/admin/lessons");
  }

  const [mentors, allTopics] = await Promise.all([
    getAllMentorsForAdmin(),
    getAllLessonTopicsForAdmin(),
  ]);

  const mentor = mentors.find((item) => item.slug === mentorSlug);
  if (!mentor) notFound();

  const topics = topicsForMentor(allTopics, mentor.slug);

  return (
    <div>
      <AdminPageHeader
        title="Lesson topics"
        description={`Create and manage lesson topics for ${mentor.names.en} (ICT, CSNR, CRT, etc.).`}
        action={
          <ButtonLink href={`/admin/lessons/topics/add?mentor=${encodeURIComponent(mentor.slug)}`}>
            + Add topic
          </ButtonLink>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <AdminBackLink href={adminLessonsListHref(mentor.slug)} label="Lessons" />
        <AdminBackLink href="/admin/lessons" label="All mentors" />
      </div>

      {topics.length === 0 ? (
        <EmptyState
          title="No topics yet"
          description={`Create topics like ICT or CSNR, then assign lessons to them.`}
          action={{
            href: `/admin/lessons/topics/add?mentor=${encodeURIComponent(mentor.slug)}`,
            label: "+ Add topic",
          }}
        />
      ) : (
        <LessonTopicsTable topics={topics} mentorName={mentor.names.en} />
      )}
    </div>
  );
}
