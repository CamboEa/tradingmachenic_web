import Link from "next/link";
import { notFound } from "next/navigation";
import { getLessonForEdit } from "@/lib/supabase/actions";
import { LessonForm } from "@/components/education/lesson-form";

export const metadata = { title: "Edit Lesson" };

export default async function EditLessonPage({
 params,
}: {
 params: Promise<{ slug: string }>;
}) {
 const { slug } = await params;
 const data = await getLessonForEdit(slug);

 if (!data) {
 notFound();
 }

 const { lesson, videos } = data;

 return (
 <div>
 <div className="mb-8 flex items-center gap-4">
 <Link
 href="/admin/lessons"
 className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
 >
 ← Back
 </Link>
 <div>
 <h1 className="text-2xl font-bold text-[#1e293b]">Edit Lesson</h1>
 <p className="mt-1 text-sm text-slate-500">{lesson.title_en}</p>
 </div>
 </div>

 <LessonForm initialData={{ lesson, videos }} isEditing />
 </div>
 );
}
