import Link from "next/link";
import { getAllLessonsForAdmin } from "@/lib/supabase/lessons";
import { LessonsList } from "@/components/lessons-list";

export const metadata = { title: "Lessons" };

export default async function LessonsPage() {
  const lessons = await getAllLessonsForAdmin();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b]">Lessons</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your video lesson library.
          </p>
        </div>
        <Link
          href="/admin/lessons/add"
          className="rounded-lg bg-[#0ea5e9] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600"
        >
          + Add Lesson
        </Link>
      </div>

      <LessonsList lessons={lessons} />
    </div>
  );
}
