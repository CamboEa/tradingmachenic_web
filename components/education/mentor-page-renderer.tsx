import { notFound } from "next/navigation";

import { EducationMentorLessonsPage } from "@/components/education/education-mentor-lessons-page";
import { EducationMentorTopicPage } from "@/components/education/education-mentor-topic-page";
import { isEducationCategory, type EducationCategory } from "@/lib/education/categories";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import {
  filterLessonsByTopic,
  topicsWithLessonCounts,
  resolveLessonTopicSlug,
} from "@/lib/education/lesson-topic-slug";
import { mentorTeachesCategory } from "@/lib/education/mentors";
import { getLessonsByMentorAndCategory } from "@/lib/supabase/lessons";
import { sortLessonsByDisplayOrder } from "@/lib/education/lessons-sort";
import {
  getLessonTopicByMentorAndSlug,
  getLessonTopicsByMentor,
} from "@/lib/supabase/lesson-topics";
import { getMentorBySlug } from "@/lib/supabase/mentors";

type MentorPageProps = {
  params: Promise<{ locale: string; slug: string; mentorSlug: string }>;
};

export function createEducationMentorPage(category: EducationCategory) {
  return async function Page({ params }: MentorPageProps) {
    const { locale: raw, mentorSlug } = await params;
    if (!isLocale(raw)) notFound();
    const locale = raw as Locale;

    return renderEducationMentorPage({ locale, category, mentorSlug });
  };
}

export async function renderEducationMentorPage({
  locale,
  category,
  mentorSlug,
}: {
  locale: Locale;
  category: EducationCategory;
  mentorSlug: string;
}) {
  if (!isEducationCategory(category)) notFound();

  const mentor = await getMentorBySlug(mentorSlug);
  if (!mentor || !mentorTeachesCategory(mentor, category)) notFound();

  const [dict, lessons, topics] = await Promise.all([
    getDictionary(locale),
    getLessonsByMentorAndCategory(mentorSlug, category),
    getLessonTopicsByMentor(mentorSlug),
  ]);

  const topicsWithCounts = topicsWithLessonCounts(topics, lessons, mentorSlug);

  return (
    <EducationMentorLessonsPage
      category={category}
      mentor={mentor}
      locale={locale}
      dict={dict}
      topics={topicsWithCounts}
    />
  );
}

export async function renderEducationMentorTopicPage({
  locale,
  category,
  mentorSlug,
  topicSlug,
}: {
  locale: Locale;
  category: EducationCategory;
  mentorSlug: string;
  topicSlug: string;
}) {
  if (!isEducationCategory(category)) notFound();

  const mentor = await getMentorBySlug(mentorSlug);
  if (!mentor || !mentorTeachesCategory(mentor, category)) notFound();

  let topic = await getLessonTopicByMentorAndSlug(mentorSlug, topicSlug);
  
  if (!topic && topicSlug === "general") {
    // Inject a synthetic 'general' topic if it doesn't exist in the DB but is requested
    topic = {
      id: "synthetic-general",
      mentorSlug,
      slug: "general",
      names: { en: "General", km: "ទូទៅ" },
      descriptions: { en: "Other lessons for this mentor", km: "មេរៀនផ្សេងៗទៀតសម្រាប់គ្រូនេះ" },
      sortOrder: 9999,
      imageUrl: null,
    };
  }

  if (!topic) notFound();

  const [dict, lessons, allTopics] = await Promise.all([
    getDictionary(locale),
    getLessonsByMentorAndCategory(mentorSlug, category),
    getLessonTopicsByMentor(mentorSlug),
  ]);

  let topicLessons: typeof lessons = [];
  if (topicSlug === "general") {
    const validTopicSlugs = new Set(allTopics.map((t) => t.slug));
    topicLessons = lessons.filter((l) => {
      const rawSlug = resolveLessonTopicSlug(l, mentorSlug);
      return rawSlug === "general" || !validTopicSlugs.has(rawSlug);
    });
  } else {
    topicLessons = filterLessonsByTopic(lessons, mentorSlug, topicSlug);
  }

  // Sort lessons correctly just in case
  topicLessons = sortLessonsByDisplayOrder(topicLessons);

  if (topicLessons.length === 0) notFound();

  return (
    <EducationMentorTopicPage
      category={category}
      mentor={mentor}
      topic={topic}
      locale={locale}
      dict={dict}
      lessons={topicLessons}
    />
  );
}
