import { notFound } from "next/navigation";

import { FastBullOrderBook } from "@/components/fastbull/fastbull-order-book";
import { PublicPageHero, PublicPageMain } from "@/components/ui";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

export default async function TechnicalAnalysisPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);

  const copy =
    locale === "km"
      ? {
          eyebrow: "ទិន្នន័យទីផ្សារ",
          title: "វិភាគបច្ចេកទេស",
          description:
            "មើលការចែកចាយការបញ្ជាទិញ/លក់ និងទីតាំងបើកជាក់ស្តែង ដើម្បីយល់ពីលំហរវាងអ្នកទិញ និងអ្នកលក់។",
        }
      : {
          eyebrow: "Market data",
          title: dict.nav.technicalAnalysis,
          description:
            "Live order-book positioning — see where pending orders and open trades cluster before you plan your setup.",
        };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicPageHero
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        backgroundImage="/Images/bg-technical-header.png"
      />

      <PublicPageMain className="max-w-none px-4 pb-16 pt-10 sm:px-8 lg:px-12 xl:px-16">
        <FastBullOrderBook />
      </PublicPageMain>
    </div>
  );
}
