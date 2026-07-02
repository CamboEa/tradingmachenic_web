import { notFound } from "next/navigation";

import { isEducationCategory } from "@/lib/education-categories";
import { renderEducationMentorTopicPage } from "@/components/education/mentor-page-renderer";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function EducationMentorTopicRoutePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; mentorSlug: string; topicSlug: string }>;
}) {
  const { locale: raw, slug, mentorSlug, topicSlug } = await params;
  if (!isLocale(raw)) notFound();
  if (!isEducationCategory(slug)) notFound();

  return renderEducationMentorTopicPage({
    locale: raw as Locale,
    category: slug,
    mentorSlug,
    topicSlug,
  });
}
