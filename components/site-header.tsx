"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { ProfileMenu } from "@/components/profile-menu";
import { SiteLogo } from "@/components/site-logo";
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
      className="flex shrink-0 items-center gap-0.5 rounded-xl border border-slate-200/90 bg-white/85 p-0.5 shadow-sm shadow-slate-900/5 backdrop-blur"
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
        className="rounded-xl border border-slate-200 bg-white/85 px-3.5 py-2 text-xs font-semibold text-[#1e293b] shadow-sm shadow-slate-900/5 transition hover:border-[#d4af37]/60 hover:bg-white hover:shadow-md sm:text-sm"
      >
        {dict.nav.register}
      </Link>
      <Link
        href={`/${locale}/login`}
        className="rounded-xl bg-[#0ea5e9] px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-sky-900/15 transition hover:bg-sky-600 hover:shadow-lg hover:shadow-sky-900/20 sm:text-sm"
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

const PRIMARY_NAV_COUNT = 4;

type NavItem = { suffix: string; label: string; href: string };

function CenterNav({
  locale,
  dict,
  pathname,
}: {
  locale: Locale;
  dict: Dictionary;
  pathname: string;
}) {
  const items: NavItem[] = [
    { suffix: "", label: dict.nav.home, href: `/${locale}` },
    { suffix: "education", label: dict.nav.education, href: `/${locale}/education` },
    { suffix: "curriculum", label: dict.nav.curriculum, href: `/${locale}/curriculum` },
    { suffix: "tools", label: dict.nav.tools, href: `/${locale}/tools` },
    { suffix: "podcast", label: dict.nav.podcast, href: `/${locale}/podcast` },
    { suffix: "about", label: dict.nav.about, href: `/${locale}/about` },
  ];

  const primary = items.slice(0, PRIMARY_NAV_COUNT);
  const overflow = items.slice(PRIMARY_NAV_COUNT);

  const [moreOpen, setMoreOpen] = useState(false);
  const moreWrapRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const moreSectionActive = overflow.some(({ suffix }) => navPathActive(pathname, locale, suffix));

  useEffect(() => {
    if (!moreOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    const onPointerDown = (e: MouseEvent) => {
      const el = moreWrapRef.current;
      if (el && !el.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [moreOpen]);

  const linkBase =
    "relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/35 sm:rounded-full";

  const linkActive =
    `${linkBase} text-[#1e293b] after:pointer-events-none after:absolute after:inset-x-2 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-[#d4af37] sm:after:hidden sm:bg-[#1e293b] sm:text-white sm:shadow-sm`;
  const linkIdle = `${linkBase} text-slate-600 hover:text-[#1e293b] sm:hover:bg-slate-50`;

  const moreButtonClass =
    moreSectionActive || moreOpen
      ? `${linkBase} flex items-center gap-1 text-[#1e293b] sm:bg-[#1e293b] sm:text-white sm:shadow-sm`
      : `${linkBase} flex items-center gap-1 text-slate-600 hover:text-[#1e293b] sm:hover:bg-slate-50`;

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-1 sm:inline-flex sm:rounded-full sm:border sm:border-slate-200/90 sm:bg-white/82 sm:px-1 sm:py-1 sm:shadow-sm sm:shadow-slate-900/5 sm:backdrop-blur-md"
      aria-label="Primary"
    >
      {primary.map(({ suffix, label, href }) => {
        const active = navPathActive(pathname, locale, suffix);
        return (
          <Link
            key={suffix || "home"}
            href={href}
            className={active ? linkActive : linkIdle}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}

      {overflow.length > 0 ? (
        <div ref={moreWrapRef} className="relative">
          <button
            type="button"
            className={moreButtonClass}
            aria-expanded={moreOpen}
            aria-haspopup="true"
            aria-controls={menuId}
            onClick={() => setMoreOpen((o) => !o)}
          >
            {dict.nav.more}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`h-4 w-4 shrink-0 transition-transform sm:opacity-90 ${moreOpen ? "rotate-180" : ""}`}
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          <div
            id={menuId}
            role="menu"
            hidden={!moreOpen}
            aria-label={dict.nav.more}
            className="absolute right-0 top-[calc(100%+0.25rem)] z-50 min-w-44 rounded-xl border border-slate-200/95 bg-white py-1 shadow-lg shadow-slate-900/12 ring-1 ring-slate-900/5 sm:left-auto sm:right-0"
          >
            {overflow.map(({ suffix, label, href }) => {
              const active = navPathActive(pathname, locale, suffix);
              return (
                <Link
                  key={suffix}
                  href={href}
                  role="menuitem"
                  className={
                    active
                      ? "block bg-slate-100 px-3 py-2 text-sm font-semibold text-[#1e293b]"
                      : "block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#1e293b]"
                  }
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMoreOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const brand = (
    <Link
      href={`/${locale}`}
      className="group flex min-w-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/35 focus-visible:ring-offset-2 sm:gap-3"
    >
      <SiteLogo size="md" priority className="rounded-lg" />
      <span className="min-w-0">
        <span className="block truncate text-lg font-bold tracking-tight text-[#1e293b] transition group-hover:text-[#0f172a] sm:text-xl">
          Trading Machenic
        </span>
        <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 lg:block">
          Trading Academy
        </span>
      </span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-[#f8fafc]/82 shadow-[0_8px_30px_-26px_rgba(15,23,42,0.45)] backdrop-blur-xl supports-backdrop-filter:bg-[#f8fafc]/76">
      <div className="mx-auto max-w-7xl px-4 py-3.5 lg:px-8">
        <div className="flex flex-col gap-3 sm:hidden">
          <div className="flex items-start justify-between gap-3">
            {brand}
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileNavOpen((open) => !open)}
                aria-expanded={mobileNavOpen}
                aria-controls="mobile-site-nav"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-[#0ea5e9]/40 hover:text-[#0ea5e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/35"
              >
                <span className="sr-only">{mobileNavOpen ? "Close menu" : "Open menu"}</span>
                <svg
                  aria-hidden
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  {mobileNavOpen ? (
                    <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>
              <AuthLanguageCluster
                locale={locale}
                pathname={pathname}
                dict={dict}
                user={user}
              />
            </div>
          </div>
          {mobileNavOpen ? (
            <div id="mobile-site-nav" className="border-t border-slate-200/70 pt-3">
              <CenterNav key={pathname} locale={locale} dict={dict} pathname={pathname} />
            </div>
          ) : null}
        </div>

        <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-x-6">
          <div className="flex min-w-0 justify-start">{brand}</div>
          <CenterNav key={pathname} locale={locale} dict={dict} pathname={pathname} />
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
