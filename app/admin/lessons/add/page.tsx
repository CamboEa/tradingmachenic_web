import Link from "next/link";
import { LessonForm } from "@/components/lesson-form";

export const metadata = { title: "Add Lesson" };

export default function AddLessonPage() {
 return (
 <div>
 <div className="mb-8 flex items-center gap-4">
 <Link
 href="/admin/lessons"
 className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-[#1e293b] transition hover:bg-slate-50"
 >
 ← Back
 </Link>
 <div>
 <h1 className="text-2xl font-bold text-[#1e293b]">Add New Lesson</h1>
 <p className="mt-1 text-sm text-slate-500">
 Follow the five steps to create a video lesson for your curriculum.
 </p>
 </div>
 </div>

 <div>
 <LessonForm />
 </div>
 </div>
 );
}
