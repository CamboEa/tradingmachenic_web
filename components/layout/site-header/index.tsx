"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ProfileMenu } from "@/components/auth/profile-menu";
import { SiteLogo } from "@/components/shared/site-logo";
import { BRAND_NAME } from "@/lib/brand";
import type { Dictionary, Locale } from "@/lib/i18n";

import { AuthLanguageCluster } from "./auth-language-cluster";
import { CenterNav } from "./center-nav";
import { LanguageToggle } from "./language-toggle";

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
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const raised = scrolled || open;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        raised
          ? "border-b border-slate-200/80 bg-white/95 shadow-sm shadow-slate-900/5 backdrop-blur-md"
          : "border-b border-transparent bg-[#F8FAFC]/80"
      }`}
    >
      {/* ── Main bar ── */}
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4 lg:px-8">

        {/* Brand */}
        <Link
          href={`/${locale}`}
          className="group flex shrink-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 focus-visible:ring-offset-2"
        >
          <SiteLogo size="md" priority className="rounded-lg" />
          <span className="hidden flex-col sm:flex">
            <span className="text-sm font-bold uppercase tracking-tight text-slate-900 transition-colors group-hover:text-slate-700">
              {BRAND_NAME}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              {dict.footer.academyLabel}
            </span>
          </span>
        </Link>

        {/* Desktop: centered nav */}
        <div className="hidden flex-1 justify-center xl:flex">
          <CenterNav locale={locale} dict={dict} pathname={pathname} />
        </div>

        {/* Desktop: right cluster */}
        <div className="hidden xl:ml-auto xl:flex xl:shrink-0 xl:items-center">
          <AuthLanguageCluster
            locale={locale}
            pathname={pathname}
            dict={dict}
            user={user}
          />
        </div>

        {/* Mobile: language toggle + hamburger */}
        <div className="ml-auto flex items-center gap-2 xl:hidden">
          <LanguageToggle locale={locale} pathname={pathname} dict={dict} />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30"
          >
            <svg
              aria-hidden
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {open ? (
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="border-t border-slate-200/80 bg-white xl:hidden">
          <div className="mx-auto max-w-7xl">
            <CenterNav locale={locale} dict={dict} pathname={pathname} mobile />

            {/* Auth buttons inside drawer */}
            <div className="border-t border-slate-100 px-4 py-3">
              {user ? (
                <div className="flex justify-start">
                  <ProfileMenu user={user} signOutLabel={dict.nav.signOut} />
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href={`/${locale}/register`}
                    className="flex-1 rounded-lg border border-slate-200 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    {dict.nav.register}
                  </Link>
                  <Link
                    href={`/${locale}/login`}
                    className="flex-1 rounded-lg bg-teal py-2.5 text-center text-sm font-semibold text-white shadow-sm shadow-teal/20 transition hover:brightness-110"
                  >
                    {dict.nav.login}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
