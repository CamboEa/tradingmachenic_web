import Link from "next/link";
import { notFound } from "next/navigation";

import { LessonPlayer } from "@/components/education/lesson-player";
import { getAllLessons, getLessonBySlug } from "@/lib/supabase/lessons";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { isDirectVideoFileUrl } from "@/lib/video";

export async function generateStaticParams() {
 const paths: { locale: Locale; slug: string }[] = [];
 const lessons = await getAllLessons();
 for (const locale of ["km", "en"] as const) {
 for (const lesson of lessons) {
 paths.push({ locale, slug: lesson.slug });
 }
 }
 return paths;
}

export async function generateMetadata({
 params,
}: {
 params: Promise<{ locale: string; slug: string }>;
}) {
 const { locale: raw, slug } = await params;
 if (!isLocale(raw)) return {};
 const locale = raw as Locale;
 const lesson = await getLessonBySlug(slug);
 if (!lesson) return {};
 return {
 title: lesson.titles[locale],
 description: lesson.summaries[locale],
 };
}

export default async function LessonPage({
 params,
}: {
 params: Promise<{ locale: string; slug: string }>;
}) {
 const { locale: raw, slug } = await params;
 if (!isLocale(raw)) notFound();
 const locale = raw as Locale;
 const [dict, allLessons] = await Promise.all([
 getDictionary(locale),
 getAllLessons(),
 ]);

 const lesson = allLessons.find((l) => l.slug === slug);
 if (!lesson) notFound();

 const index = allLessons.findIndex((l) => l.slug === slug);
 const related = allLessons.filter((_, i) => i > index).slice(0, 3);

 const showHostedHint =
 lesson.type === "paid" ||
 lesson.videos.some((v) => isDirectVideoFileUrl(v.embedUrl));

 return (
 <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
 <p className="mb-6 text-sm">
 <Link
 href={`/${locale}/education`}
 className="font-semibold text-[#0ea5e9] transition hover:text-sky-700"
 >
 ← {dict.course.backToCourse}
 </Link>
 </p>

 <LessonPlayer
 lesson={lesson}
 related={related}
 locale={locale}
 t={{
 videoInLessonHeading: dict.course.videoInLessonHeading,
 objectives: dict.course.objectives,
 relatedLessons: dict.course.relatedLessons,
 videosInLesson: dict.course.videosInLesson,
 paidVideoHint: showHostedHint ? dict.course.paidVideoHint : undefined,
 videoFallback: showHostedHint ? dict.course.videoFallback : undefined,
 }}
 />
 </main>
 );
}
