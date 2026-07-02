import { notFound } from "next/navigation";

import { isEducationCategory } from "@/lib/education/categories";
import { renderEducationMentorPage } from "@/components/education/mentor-page-renderer";
import { isLocale, type Locale } from "@/lib/i18n";

export default async function EducationMentorRoutePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; mentorSlug: string }>;
}) {
  const { locale: raw, slug, mentorSlug } = await params;
  if (!isLocale(raw)) notFound();
  if (!isEducationCategory(slug)) notFound();

  return renderEducationMentorPage({
    locale: raw as Locale,
    category: slug,
    mentorSlug,
  });
}
