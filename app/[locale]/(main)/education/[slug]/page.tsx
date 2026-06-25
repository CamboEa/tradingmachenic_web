import { notFound } from "next/navigation";

import { EducationBreadcrumb } from "@/components/education/education-breadcrumb";
import { LessonPlayer } from "@/components/education/lesson-player";
import { PublicPageMain } from "@/components/ui";
import { renderCategoryPage } from "@/lib/education-category-page";
import { isEducationCategory } from "@/lib/education-categories";
import { categoryNavKeys } from "@/lib/education-category-meta";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { educationMentorHref } from "@/lib/mentors";
import { getAllLessons, getLessonBySlug } from "@/lib/supabase/lessons";
import { getMentorBySlug } from "@/lib/supabase/mentors";
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

  if (isEducationCategory(slug)) {
    const dict = await getDictionary(locale);
    return { title: dict.nav[categoryNavKeys[slug]] };
  }

  const lesson = await getLessonBySlug(slug);
  if (!lesson) return {};
  return {
    title: lesson.titles[locale],
    description: lesson.summaries[locale],
  };
}

export default async function EducationSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  if (isEducationCategory(slug)) {
    return renderCategoryPage(locale, slug);
  }

  const [dict, allLessons] = await Promise.all([
    getDictionary(locale),
    getAllLessons(),
  ]);

  const lesson = allLessons.find((l) => l.slug === slug);
  if (!lesson) notFound();

  const mentor =
    lesson.mentorSlug && lesson.category
      ? await getMentorBySlug(lesson.mentorSlug)
      : null;

  const breadcrumbParentHref =
    lesson.mentorSlug && lesson.category
      ? educationMentorHref(locale, lesson.category, lesson.mentorSlug)
      : lesson.category
        ? `/${locale}/education/${lesson.category}`
        : `/${locale}/education`;

  const breadcrumbParentLabel =
    mentor && lesson.category
      ? dict.course.mentorLessons.replace("{mentor}", mentor.names[locale])
      : lesson.category
        ? dict.nav[categoryNavKeys[lesson.category]]
        : dict.nav.education;

  const showHostedHint =
    lesson.type === "paid" ||
    lesson.videos.some((v) => isDirectVideoFileUrl(v.embedUrl));

  return (
    <div className="flex flex-col">
      <PublicPageMain className="pb-16 pt-8">
        <EducationBreadcrumb href={breadcrumbParentHref} label={breadcrumbParentLabel} />

        <LessonPlayer
          lesson={lesson}
          locale={locale}
          t={{
            videoInLessonHeading: dict.course.videoInLessonHeading,
            objectives: dict.course.objectives,
            videosInLesson: dict.course.videosInLesson,
            paidVideoHint: showHostedHint ? dict.course.paidVideoHint : undefined,
            videoFallback: showHostedHint ? dict.course.videoFallback : undefined,
          }}
        />
      </PublicPageMain>
    </div>
  );
}
