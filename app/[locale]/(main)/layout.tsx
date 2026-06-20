import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { TradingViewTickerTape } from "@/components/tradingview/tradingview-ticker-tape";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getSessionUser } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();

  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const user = await getSessionUser();

  return (
    <div className="flex flex-1 flex-col">
      <TradingViewTickerTape locale={locale} />
      <SiteHeader locale={locale} dict={dict} user={user} />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
