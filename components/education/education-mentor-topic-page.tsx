import { EducationBreadcrumb } from "@/components/education/education-breadcrumb";
import { EducationTopicPlaylistSections } from "@/components/education/education-topic-playlist-sections";
import { PublicPageHero, PublicPageMain } from "@/components/ui";
import type { EducationCategory } from "@/lib/education-categories";
import { getCategoryHeaderImage } from "@/lib/education-category-theme";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Lesson } from "@/lib/course";
import { educationMentorHref } from "@/lib/mentors";
import type { Mentor } from "@/lib/mentors";
import type { LessonTopic } from "@/lib/supabase/lesson-topics";

export function EducationMentorTopicPage({
  category,
  mentor,
  topic,
  locale,
  dict,
  lessons,
}: {
  category: EducationCategory;
  mentor: Mentor;
  topic: LessonTopic;
  locale: Locale;
  dict: Dictionary;
  lessons: Lesson[];
}) {
  const mentorName = mentor.names[locale];
  const mentorHref = educationMentorHref(locale, category, mentor.slug);
  const topicTitle = topic.names[locale] || topic.names.en;
  const topicDescription = topic.descriptions[locale] || topic.descriptions.en;

  return (
    <div className="flex flex-col">
      <PublicPageHero
        eyebrow={mentorName}
        title={topicTitle}
        description={topicDescription || mentor.titles[locale]}
        backgroundImage={getCategoryHeaderImage(category)}
      />

      <PublicPageMain className="pb-16">
        <EducationBreadcrumb href={mentorHref} label={mentorName} />
        <EducationTopicPlaylistSections
          lessons={lessons}
          locale={locale}
          dict={dict}
          emptyMessage={dict.course.noLessonsForMentor}
        />
      </PublicPageMain>
    </div>
  );
}
