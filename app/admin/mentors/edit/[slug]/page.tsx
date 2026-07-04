import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";

import { MentorDetailSections } from "@/components/education/mentor-detail-sections";
import { parseMentorDetailTab } from "@/components/education/mentor-detail/mentor-detail-config";
import { getStaffAccess } from "@/lib/auth/staff-access";
import { getAllLessonsForAdmin } from "@/lib/supabase/lessons";
import { getAllLessonTopicsForAdmin } from "@/lib/supabase/lesson-topics";
import { getMentorForAdminBySlug } from "@/lib/supabase/mentors";
import { getProfileByMentorId } from "@/lib/supabase/profiles";

export const metadata = { title: "Edit mentor" };

export const dynamic = "force-dynamic";

export default async function EditMentorPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string; topic?: string }>;
}) {
  const { slug } = await params;
  const { tab, topic } = await searchParams;
  const access = await getStaffAccess();
  if (!access) notFound();

  const decodedSlug = decodeURIComponent(slug);
  if (access.role === "mentor" && access.mentorSlug !== decodedSlug) {
    redirect(`/admin/mentors/edit/${access.mentorSlug}`);
  }

  const initialSection = parseMentorDetailTab(tab);

  const mentorScope = access.role === "mentor" ? access.mentorSlug : undefined;
  const [mentor, lessons, topics] = await Promise.all([
    getMentorForAdminBySlug(slug),
    getAllLessonsForAdmin(mentorScope),
    getAllLessonTopicsForAdmin(mentorScope),
  ]);

  if (!mentor) notFound();

  const linkedProfile =
    access.role === "admin" ? await getProfileByMentorId(mentor.id) : null;

  return (
    <Suspense fallback={<div className="text-sm text-ink-soft">Loading mentor…</div>}>
      <MentorDetailSections
        mentor={mentor}
        lessons={lessons}
        topics={topics}
        isAdmin={access.role === "admin"}
        linkedProfile={linkedProfile}
        initialSection={initialSection}
        initialTopicSlug={topic}
      />
    </Suspense>
  );
}
