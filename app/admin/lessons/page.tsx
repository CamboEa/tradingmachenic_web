import { Suspense } from "react";

import { AdminLessonsHub } from "@/components/education/admin-lessons-hub";
import { EmptyState } from "@/components/ui";
import { getAllLessonsForAdmin } from "@/lib/supabase/lessons";
import { getAllLessonTopicsForAdmin } from "@/lib/supabase/lesson-topics";
import { getAllMentorsForAdmin } from "@/lib/supabase/mentors";

export const metadata = { title: "Lessons" };

function LessonsHubFallback() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-2xl border border-bridge/30 bg-surface-soft/60"
        />
      ))}
    </div>
  );
}

export default async function LessonsPage() {
  const [lessons, mentors, topics] = await Promise.all([
    getAllLessonsForAdmin(),
    getAllMentorsForAdmin(),
    getAllLessonTopicsForAdmin(),
  ]);

  const hasContent = lessons.length > 0 || mentors.length > 0;

  return (
    <div>
      {!hasContent ? (
        <EmptyState
          title="No lessons yet"
          description="Create a mentor, add lesson topics, then add video lessons."
          action={{ href: "/admin/mentors/add", label: "+ Add Mentor" }}
        />
      ) : (
        <Suspense fallback={<LessonsHubFallback />}>
          <AdminLessonsHub mentors={mentors} lessons={lessons} topics={topics} />
        </Suspense>
      )}
    </div>
  );
}
