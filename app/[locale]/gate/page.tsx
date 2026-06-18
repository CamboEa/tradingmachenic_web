import { notFound } from "next/navigation";

import { SiteGateForm } from "@/components/security/site-gate-form";
import { SiteLogo } from "@/components/shared/site-logo";
import { Panel } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { BRAND_NAME } from "@/lib/brand";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { safeGateReturnTo } from "@/lib/security/site-gate";
import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

export default async function SiteGatePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dict = await getDictionary(locale);
  const { returnTo } = await searchParams;

  const destination = safeGateReturnTo(returnTo, locale);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8FAFC] px-4">
      <Panel className="w-full max-w-md">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <SiteLogo size="lg" />
          <Eyebrow variant="admin">{BRAND_NAME}</Eyebrow>
        </div>
        <h1 className={cn("mt-3", ui.pageTitle)}>{dict.gatePage.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-(--color-ink-muted)">
          {dict.gatePage.body}
        </p>
        <SiteGateForm
          returnTo={destination}
          labels={{
            loading: dict.gatePage.loading,
            error: dict.gatePage.error,
          }}
        />
      </Panel>
    </div>
  );
}
