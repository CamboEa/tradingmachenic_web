import Link from "next/link";

import { LessonForm } from "@/components/education/lesson-form";
import { isEducationCategory } from "@/lib/education-categories";
import { getAllMentorsForAdmin } from "@/lib/supabase/mentors";

export const metadata = { title: "Add Lesson" };

export default async function AddLessonPage({
  searchParams,
}: {
  searchParams: Promise<{ mentor?: string; category?: string }>;
}) {
  const mentors = await getAllMentorsForAdmin();
  const params = await searchParams;
  const mentorParam = params.mentor?.trim() ?? "";
  const categoryParam = params.category?.trim() ?? "";

  const defaultMentorSlug = mentors.some((mentor) => mentor.slug === mentorParam)
    ? mentorParam
    : "";

  const matchedMentor = mentors.find((mentor) => mentor.slug === defaultMentorSlug);
  const defaultCategory = isEducationCategory(categoryParam)
    ? categoryParam
    : matchedMentor?.categories[0] ?? "";

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/lessons"
          className="rounded-lg border border-bridge/40 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-soft"
        >
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add New Lesson</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Follow the five steps to create a video lesson for your curriculum.
          </p>
        </div>
      </div>

      <div>
        <LessonForm
          mentors={mentors}
          defaultMentorSlug={defaultMentorSlug}
          defaultCategory={defaultCategory}
        />
      </div>
    </div>
  );
}
