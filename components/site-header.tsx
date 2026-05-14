"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ProfileMenu } from "@/components/profile-menu";
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

function navPathActive(pathname: string, locale: Locale, pathSuffix: string): boolean {
  const base = `/${locale}`;
  if (pathSuffix === "") {
    return pathname === base || pathname === `${base}/`;
  }
  const full = `${base}/${pathSuffix}`;
  return pathname === full || pathname.startsWith(`${full}/`);
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
  const seg =
    "rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/30";
  return (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-200/90 bg-white/90 p-0.5 shadow-sm"
      role="group"
      aria-label={dict.nav.language}
    >
      <span className="sr-only">{dict.nav.language}</span>
      <Link
        href={hrefWithLocale(pathname, "en")}
        className={
          locale === "en"
            ? `${seg} bg-[#1e293b] text-white shadow-sm`
            : `${seg} text-slate-500 hover:bg-slate-50 hover:text-[#1e293b]`
        }
        hrefLang="en"
      >
        {dict.nav.english}
      </Link>
      <Link
        href={hrefWithLocale(pathname, "km")}
        className={
          locale === "km"
            ? `${seg} bg-[#1e293b] text-white shadow-sm`
            : `${seg} text-slate-500 hover:bg-slate-50 hover:text-[#1e293b]`
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
        className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#1e293b] shadow-sm transition hover:border-[#d4af37]/50 hover:bg-[#fafafa] sm:text-sm"
      >
        {dict.nav.register}
      </Link>
      <Link
        href={`/${locale}/login`}
        className="rounded-lg bg-[#0ea5e9] px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-sky-900/15 transition hover:bg-sky-600 sm:text-sm"
      >
        {dict.nav.login}
      </Link>
    </>
  );
}

/** Register, Login (or Sign Out), and language toggle aligned on the right */
function AuthLanguageCluster({
  locale,
  pathname,
  dict,
  user,
}: {
  locale: Locale;
  pathname: string;
  dict: Dictionary;
  user?: User | null;
}) {
  return (
    <div className="flex max-w-full flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:gap-x-3">
      {user ? (
        <ProfileMenu user={user} signOutLabel={dict.nav.signOut} />
      ) : (
        <RegisterLoginLinks locale={locale} dict={dict} />
      )}
      <span className="hidden h-6 w-px shrink-0 bg-slate-200 sm:block" aria-hidden />
      <LanguageToggle locale={locale} pathname={pathname} dict={dict} />
    </div>
  );
}

function CenterNav({
  locale,
  dict,
  pathname,
}: {
  locale: Locale;
  dict: Dictionary;
  pathname: string;
}) {
  const items: { suffix: string; label: string; href: string }[] = [
    { suffix: "", label: dict.nav.home, href: `/${locale}` },
    { suffix: "education", label: dict.nav.education, href: `/${locale}/education` },
    { suffix: "curriculum", label: dict.nav.curriculum, href: `/${locale}/curriculum` },
    { suffix: "tools", label: dict.nav.tools, href: `/${locale}/tools` },
    { suffix: "about", label: dict.nav.about, href: `/${locale}/about` },
  ];

  const linkBase =
    "relative whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/35 sm:rounded-full";

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1 sm:inline-flex sm:rounded-full sm:border sm:border-slate-200/90 sm:bg-white/80 sm:px-1 sm:py-1 sm:shadow-sm sm:backdrop-blur-sm"
      aria-label="Primary"
    >
      {items.map(({ suffix, label, href }) => {
        const active = navPathActive(pathname, locale, suffix);
        return (
          <Link
            key={suffix || "home"}
            href={href}
            className={
              active
                ? `${linkBase} text-[#1e293b] after:pointer-events-none after:absolute after:inset-x-2 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-[#d4af37] sm:after:hidden sm:bg-[#1e293b] sm:text-white sm:shadow-sm`
                : `${linkBase} text-slate-600 hover:text-[#1e293b] sm:hover:bg-slate-50`
            }
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteHeader({
  locale,
  dict,
  user,
}: {
  locale: Locale;
  dict: Dictionary;
  user?: User | null;
}) {
  const pathname = usePathname() ?? `/${locale}`;

  const brand = (
    <Link
      href={`/${locale}`}
      className="group flex min-w-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/35 focus-visible:ring-offset-2"
    >
      <span
        className="h-7 w-1 shrink-0 rounded-full bg-[#d4af37] shadow-sm shadow-amber-900/15 sm:h-8"
        aria-hidden
      />
      <span className="truncate text-lg font-bold tracking-tight text-[#1e293b] transition group-hover:text-[#0f172a] sm:text-xl">
        Trading Machenic
      </span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f8fafc]/95 shadow-[0_1px_2px_rgba(15,23,42,0.04)] backdrop-blur-md supports-backdrop-filter:bg-[#f8fafc]/88">
      <div className="mx-auto max-w-6xl px-4 py-3.5 lg:px-8">
        <div className="flex flex-col gap-3 sm:hidden">
          <div className="flex items-start justify-between gap-3">
            {brand}
            <AuthLanguageCluster
              locale={locale}
              pathname={pathname}
              dict={dict}
              user={user}
            />
          </div>
          <div className="border-t border-slate-200/70 pt-3">
            <CenterNav locale={locale} dict={dict} pathname={pathname} />
          </div>
        </div>

        <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-x-6">
          <div className="flex min-w-0 justify-start">{brand}</div>
          <CenterNav locale={locale} dict={dict} pathname={pathname} />
          <div className="flex min-w-0 justify-end">
            <AuthLanguageCluster
              locale={locale}
              pathname={pathname}
              dict={dict}
              user={user}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
