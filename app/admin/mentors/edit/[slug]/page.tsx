import { notFound } from "next/navigation";

import { MentorDetailSections } from "@/components/education/mentor-detail-sections";
import { getAllLessonsForAdmin } from "@/lib/supabase/lessons";
import { getAllLessonTopicsForAdmin } from "@/lib/supabase/lesson-topics";
import { getMentorForAdminBySlug } from "@/lib/supabase/mentors";

export const metadata = { title: "Edit mentor" };

export default async function EditMentorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [mentor, lessons, topics] = await Promise.all([
    getMentorForAdminBySlug(slug),
    getAllLessonsForAdmin(),
    getAllLessonTopicsForAdmin(),
  ]);

  if (!mentor) notFound();

  return (
    <MentorDetailSections mentor={mentor} lessons={lessons} topics={topics} />
  );
}
