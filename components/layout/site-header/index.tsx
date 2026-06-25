"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ProfileMenu } from "@/components/auth/profile-menu";
import { SiteLogo } from "@/components/shared/site-logo";
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
      className={`sticky top-0 z-40 border-b transition-all duration-200 backdrop-blur-md ${
        raised
          ? "border-bridge/40 bg-surface/98 shadow-sm shadow-black/20"
          : "border-bridge/30 bg-background/95"
      }`}
    >
      {/* ── Main bar ── */}
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 lg:gap-4 lg:px-8">

        {/* Left: brand */}
        <Link
          href={`/${locale}`}
          className="group flex shrink-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30 focus-visible:ring-offset-2"
        >
          <SiteLogo size="nav" priority />
          <span className="text-sm font-bold uppercase leading-none tracking-[0.14em]">
            <span className="text-foreground transition-colors group-hover:text-ink-muted">FINHUB</span>
            <span className="text-teal">KH</span>
          </span>
        </Link>

        {/* Centre: nav links (desktop only) */}
        <div className="hidden items-center justify-center xl:flex">
          <CenterNav locale={locale} dict={dict} pathname={pathname} />
        </div>

        {/* Right: auth + language (desktop) / language + hamburger (mobile) */}
        <div className="flex items-center justify-end gap-3">
          {/* Desktop auth cluster */}
          <div className="hidden xl:flex xl:items-center xl:gap-3">
            <AuthLanguageCluster
              locale={locale}
              pathname={pathname}
              dict={dict}
              user={user}
            />
          </div>

          {/* Mobile: language + hamburger */}
          <div className="flex items-center gap-2 xl:hidden">
            <LanguageToggle locale={locale} pathname={pathname} dict={dict} />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-bridge/40 bg-surface text-ink-muted transition hover:border-bridge/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30"
            >
              <svg aria-hidden className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {open ? (
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {open && (
        <div className="border-t border-bridge/40 bg-surface xl:hidden">
          <div className="mx-auto max-w-7xl">
            <CenterNav locale={locale} dict={dict} pathname={pathname} mobile />
            <div className="border-t border-bridge/30 px-4 py-3">
              {user ? (
                <ProfileMenu user={user} signOutLabel={dict.nav.signOut} />
              ) : (
                <div className="flex gap-2">
                  <Link
                    href={`/${locale}/register`}
                    className="flex-1 rounded-lg border border-bridge/40 py-2.5 text-center text-sm font-semibold text-ink-muted transition hover:bg-surface-soft"
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
