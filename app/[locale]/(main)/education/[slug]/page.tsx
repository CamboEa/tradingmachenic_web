import { notFound } from "next/navigation";

import { EducationBreadcrumb } from "@/components/education/education-breadcrumb";
import { LessonPlayer } from "@/components/education/lesson-player";
import { PublicPageMain } from "@/components/ui";
import { renderCategoryPage } from "@/components/education/category-page-renderer";
import { isEducationCategory } from "@/lib/education/categories";
import { categoryNavKeys } from "@/lib/education/category-meta";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { educationMentorHref, educationMentorTopicHref } from "@/lib/education/mentors";
import { resolveLessonTopicSlug } from "@/lib/education/lesson-topic-slug";
import { getAllLessons, getLessonBySlug } from "@/lib/supabase/lessons";
import { getLessonTopicByMentorAndSlug } from "@/lib/supabase/lesson-topics";
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
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const { locale: raw, slug } = await params;
  const { ep: epRaw } = await searchParams;
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

  const topicSlug =
    lesson.mentorSlug && lesson.category
      ? resolveLessonTopicSlug(lesson, lesson.mentorSlug)
      : null;

  const topic =
    lesson.mentorSlug && topicSlug
      ? await getLessonTopicByMentorAndSlug(lesson.mentorSlug, topicSlug)
      : null;

  let breadcrumbParentHref = `/${locale}/education`;
  let breadcrumbParentLabel = dict.nav.education;

  if (lesson.mentorSlug && lesson.category && topic && topicSlug) {
    // Check if topic or mentor pages would instantly redirect back to this lesson
    const mentorLessons = allLessons.filter(
      (l) => l.mentorSlug === lesson.mentorSlug && l.category === lesson.category
    );
    const topicLessons = mentorLessons.filter(
      (l) => resolveLessonTopicSlug(l, lesson.mentorSlug!) === topicSlug
    );
    const mentorTopicsCount = new Set(
      mentorLessons.map((l) => resolveLessonTopicSlug(l, lesson.mentorSlug!)).filter(Boolean)
    ).size;

    if (topicLessons.length > 1) {
      // Topic page won't redirect, so go to Topic
      breadcrumbParentHref = educationMentorTopicHref(locale, lesson.category, lesson.mentorSlug, topicSlug);
      breadcrumbParentLabel = topic.names[locale] || topic.names.en;
    } else if (mentorTopicsCount > 1) {
      // Topic page would redirect, but Mentor page won't, so go to Mentor
      breadcrumbParentHref = educationMentorHref(locale, lesson.category, lesson.mentorSlug);
      breadcrumbParentLabel = mentor ? dict.course.mentorLessons.replace("{mentor}", mentor.names[locale]) : "";
    } else {
      // Both Topic and Mentor pages would redirect back to here, so go to Category
      breadcrumbParentHref = `/${locale}/education/${lesson.category}`;
      breadcrumbParentLabel = dict.nav[categoryNavKeys[lesson.category]];
    }
  } else if (lesson.mentorSlug && lesson.category) {
    breadcrumbParentHref = educationMentorHref(locale, lesson.category, lesson.mentorSlug);
    breadcrumbParentLabel = mentor ? dict.course.mentorLessons.replace("{mentor}", mentor.names[locale]) : "";
  } else if (lesson.category) {
    breadcrumbParentHref = `/${locale}/education/${lesson.category}`;
    breadcrumbParentLabel = dict.nav[categoryNavKeys[lesson.category]];
  }

  const showHostedHint =
    lesson.type === "paid" ||
    lesson.videos.some((v) => isDirectVideoFileUrl(v.embedUrl));

  const parsedEp = epRaw ? Number.parseInt(epRaw, 10) : 0;
  const initialVideoIndex =
    Number.isFinite(parsedEp) && parsedEp > 0 ? parsedEp - 1 : 0;

  let relatedLessons = allLessons
    .filter((l) => l.slug !== lesson.slug && l.category === lesson.category && l.mentorSlug === lesson.mentorSlug)
    .slice(0, 5);

  if (relatedLessons.length === 0) {
    relatedLessons = allLessons
      .filter((l) => l.slug !== lesson.slug && l.category === lesson.category)
      .slice(0, 5);
  }

  return (
    <div className="flex flex-col">
      <PublicPageMain className="pb-16 pt-8">
        <EducationBreadcrumb href={breadcrumbParentHref} label={breadcrumbParentLabel} />

        <LessonPlayer
          lesson={lesson}
          locale={locale}
          initialVideoIndex={initialVideoIndex}
          relatedLessons={relatedLessons}
          t={{
            videoInLessonHeading: dict.course.videoInLessonHeading,
            objectives: dict.course.objectives,
            videosInLesson: dict.course.videosInLesson,
            episodeLabel: dict.course.episodeLabel,
            episodesInPlaylist: dict.course.episodesInPlaylist,
            relatedLessons: dict.course.relatedLessons,
            paidVideoHint: showHostedHint ? dict.course.paidVideoHint : undefined,
            videoFallback: showHostedHint ? dict.course.videoFallback : undefined,
          }}
        />
      </PublicPageMain>
    </div>
  );
}
