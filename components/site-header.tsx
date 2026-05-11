"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Dictionary, Locale } from "@/lib/i18n";
import { locales } from "@/lib/i18n";

function hrefWithLocale(pathname: string, nextLocale: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 0 && locales.includes(parts[0] as Locale)) {
    parts[0] = nextLocale;
  } else {
    parts.unshift(nextLocale);
  }
  return `/${parts.join("/")}`;
}

function LanguageToggle({
  locale,
  pathname,
  dict,
}: {
  locale: Locale;
  pathname: string;
  dict: Dictionary;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span className="sr-only">{dict.nav.language}</span>
      <Link
        href={hrefWithLocale(pathname, "en")}
        className={
          locale === "en"
            ? "rounded-full bg-[color-mix(in_oklab,var(--color-gold)_22%,transparent)] px-3 py-1 text-[var(--color-ink)]"
            : "rounded-full px-3 py-1 transition-colors hover:bg-[color-mix(in_oklab,var(--color-teal)_12%,transparent)]"
        }
        hrefLang="en"
      >
        {dict.nav.english}
      </Link>
      <Link
        href={hrefWithLocale(pathname, "km")}
        className={
          locale === "km"
            ? "rounded-full bg-[color-mix(in_oklab,var(--color-gold)_22%,transparent)] px-3 py-1 text-[var(--color-ink)]"
            : "rounded-full px-3 py-1 transition-colors hover:bg-[color-mix(in_oklab,var(--color-teal)_12%,transparent)]"
        }
        hrefLang="km"
      >
        {dict.nav.khmer}
      </Link>
    </div>
  );
}

function RegisterLoginLinks({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <>
      <Link
        href={`/${locale}/register`}
        className="rounded-lg border border-[color-mix(in_oklab,var(--color-gold)_42%,var(--color-bridge))] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-gold)] sm:px-4 sm:py-2 sm:text-sm"
      >
        {dict.nav.register}
      </Link>
      <Link
        href={`/${locale}/login`}
        className="rounded-lg bg-[var(--color-teal)] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-105 sm:px-4 sm:py-2 sm:text-sm"
      >
        {dict.nav.login}
      </Link>
    </>
  );
}

/** Register, Login, and language toggle aligned on the right */
function AuthLanguageCluster({
  locale,
  pathname,
  dict,
}: {
  locale: Locale;
  pathname: string;
  dict: Dictionary;
}) {
  return (
    <div className="flex max-w-full flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:gap-x-3">
      <RegisterLoginLinks locale={locale} dict={dict} />
      <span
        className="hidden h-5 w-px shrink-0 bg-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] sm:block"
        aria-hidden
      />
      <LanguageToggle locale={locale} pathname={pathname} dict={dict} />
    </div>
  );
}

function CenterNav({
  locale,
  dict,
  linkClass,
}: {
  locale: Locale;
  dict: Dictionary;
  linkClass: string;
}) {
  return (
    <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-medium text-[var(--color-ink-muted)] lg:gap-x-6">
      <Link href={`/${locale}`} className={linkClass}>
        {dict.nav.home}
      </Link>
      <Link href={`/${locale}/education`} className={linkClass}>
        {dict.nav.education}
      </Link>
      <Link href={`/${locale}/curriculum`} className={linkClass}>
        {dict.nav.curriculum}
      </Link>
      <Link href={`/${locale}/tools`} className={linkClass}>
        {dict.nav.tools}
      </Link>
      <Link href={`/${locale}/about`} className={linkClass}>
        {dict.nav.about}
      </Link>
    </nav>
  );
}

export function SiteHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname() ?? `/${locale}`;
  const linkClass =
    "transition-colors hover:text-[var(--color-gold)] whitespace-nowrap";

  return (
    <header className="border-b border-[color-mix(in_oklab,var(--color-bridge)_12%,transparent)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-6xl px-4 py-4 lg:px-8">
        <div className="flex flex-col gap-4 sm:hidden">
          <div className="flex items-start justify-between gap-3">
            <Link
              href={`/${locale}`}
              className="text-lg font-semibold tracking-tight text-[var(--color-ink)]"
            >
              Trading Machenic
            </Link>
            <AuthLanguageCluster
              locale={locale}
              pathname={pathname}
              dict={dict}
            />
          </div>
          <CenterNav locale={locale} dict={dict} linkClass={linkClass} />
        </div>

        <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-x-4">
          <div className="flex min-w-0 justify-start">
            <Link
              href={`/${locale}`}
              className="text-lg font-semibold tracking-tight text-[var(--color-ink)]"
            >
              Trading Machenic
            </Link>
          </div>
          <CenterNav locale={locale} dict={dict} linkClass={linkClass} />
          <div className="flex min-w-0 justify-end">
            <AuthLanguageCluster
              locale={locale}
              pathname={pathname}
              dict={dict}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
