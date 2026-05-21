import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { TradingViewTickerTape } from "@/components/tradingview/tradingview-ticker-tape";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { getSessionUser } from "@/lib/supabase/server";

export async function generateStaticParams() {
 return [{ locale: "km" }, { locale: "en" }];
}

export async function generateMetadata({
 params,
}: {
 params: Promise<{ locale: string }>;
}): Promise<Metadata> {
 const { locale: raw } = await params;
 if (!isLocale(raw)) return {};
 const dict = await getDictionary(raw);
 return {
 title: dict.meta.title,
 description: dict.meta.description,
 alternates: {
 languages: {
 km: "/km",
 en: "/en",
 },
 },
 };
}

export default async function LocaleLayout({
 children,
 params,
}: Readonly<{
 children: React.ReactNode;
 params: Promise<{ locale: string }>;
}>) {
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
 <SiteFooter locale={locale} dict={dict} />
 </div>
 );
}
