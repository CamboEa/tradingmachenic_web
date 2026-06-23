import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteGateForm } from "@/components/security/site-gate-form";
import { SiteLogo } from "@/components/shared/site-logo";
import { BRAND_NAME } from "@/lib/brand";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";
import { safeGateReturnTo } from "@/lib/security/site-gate";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const dict = await getDictionary(raw);
  return {
    title: dict.gatePage.title,
    robots: { index: false, follow: false },
  };
}

function TrustCheckIcon() {
  return (
    <svg
      viewBox="0 0 10 8"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3 text-slate-brand"
      aria-hidden
    >
      <path d="M1 4l2.5 2.5L9 1" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 2 4 5v6c0 5.25 3.4 10.15 8 11.25 4.6-1.1 8-6 8-11.25V5l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

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
  const copy = dict.gatePage;
  const { returnTo } = await searchParams;

  const destination = safeGateReturnTo(returnTo, locale);

  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-[#F8FAFC] px-4 py-10 sm:px-6 lg:py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-dots opacity-35"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-teal/5 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 translate-x-1/4 translate-y-1/4 rounded-full bg-gold/5 blur-3xl"
        aria-hidden
      />

      <div className="relative flex w-full max-w-4xl overflow-hidden shadow-2xl shadow-slate-900/15">
        <div className="hidden w-100 shrink-0 flex-col justify-between bg-slate-brand px-10 py-12 lg:flex">
          <div>
            <div className="flex items-center gap-3">
              <SiteLogo size="md" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
                {BRAND_NAME}
              </span>
            </div>

            <p className="mt-10 text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
              {copy.eyebrow}
            </p>
            <h2 className="mt-3 text-[2rem] font-bold leading-tight text-white">
              {copy.heroTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {copy.heroBody}
            </p>

            <ul className="mt-8 space-y-4">
              {copy.trustPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold">
                    <TrustCheckIcon />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-10 text-xs text-slate-500">{copy.disclaimer}</p>
        </div>

        <div className="flex-1 bg-white px-8 py-10 sm:px-10 sm:py-12">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <SiteLogo size="md" />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
              {BRAND_NAME}
            </span>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-gold">
              <ShieldIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-gold">
                {copy.eyebrow}
              </p>
              <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-brand sm:text-3xl">
                {copy.title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {copy.intro}
              </p>
            </div>
          </div>

          <SiteGateForm
            returnTo={destination}
            labels={{
              loading: copy.loading,
              error: copy.error,
              turnstileError: copy.turnstileError,
            }}
          />

          <p className="mt-8 text-center text-xs text-slate-400 lg:hidden">
            {copy.disclaimer}
          </p>
        </div>
      </div>
    </main>
  );
}
