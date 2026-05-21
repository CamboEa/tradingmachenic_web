"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SiteLogo } from "@/components/shared/site-logo";
import type { Dictionary, Locale } from "@/lib/i18n";

import { AuthLanguageCluster } from "./auth-language-cluster";
import { CenterNav } from "./center-nav";

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

  const headerSurface = scrolled
    ? "border-b border-white/60 bg-[#f8fafc]/82 backdrop-blur-xl supports-backdrop-filter:bg-[#f8fafc]/76"
    : "border-b border-transparent bg-transparent backdrop-blur-none";

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${headerSurface}`}
    >
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-[#0ea5e9]/40 hover:text-[#0ea5e9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/35"
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
            <div
              id="mobile-site-nav"
              className={`border-t pt-3 ${scrolled ? "border-slate-200/70" : "border-slate-200/40"}`}
            >
              <CenterNav
                key={pathname}
                locale={locale}
                dict={dict}
                pathname={pathname}
                scrolled={scrolled}
              />
            </div>
          ) : null}
        </div>

        <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-x-6">
          <div className="flex min-w-0 justify-start">{brand}</div>
          <CenterNav
            key={pathname}
            locale={locale}
            dict={dict}
            pathname={pathname}
            scrolled={scrolled}
          />
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
