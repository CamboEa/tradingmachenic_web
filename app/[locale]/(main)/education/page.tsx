import { notFound } from "next/navigation";

import { EducationHubPage } from "@/components/education/education-hub-page";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function EducationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);

  return <EducationHubPage locale={locale} dict={dict} />;
}
