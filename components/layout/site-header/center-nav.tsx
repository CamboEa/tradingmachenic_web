"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import type { Dictionary, Locale } from "@/lib/i18n";

import { navPathActive } from "./nav-utils";

const PRIMARY_NAV_COUNT = 4;

type NavItem = { suffix: string; label: string; href: string };

export function CenterNav({
  locale,
  dict,
  pathname,
  scrolled,
}: {
  locale: Locale;
  dict: Dictionary;
  pathname: string;
  scrolled: boolean;
}) {
  const items: NavItem[] = [
    { suffix: "", label: dict.nav.home, href: `/${locale}` },
    { suffix: "education", label: dict.nav.education, href: `/${locale}/education` },
    { suffix: "curriculum", label: dict.nav.curriculum, href: `/${locale}/curriculum` },
    { suffix: "tools", label: dict.nav.tools, href: `/${locale}/tools` },
    { suffix: "podcast", label: dict.nav.podcast, href: `/${locale}/podcast` },
    { suffix: "blog", label: dict.nav.blog, href: `/${locale}/blog` },
    { suffix: "about", label: dict.nav.about, href: `/${locale}/about` },
  ];

  const primary = items.slice(0, PRIMARY_NAV_COUNT);
  const overflow = items.slice(PRIMARY_NAV_COUNT);

  const [moreOpen, setMoreOpen] = useState(false);
  const moreWrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuId = useId();

  const moreSectionActive = overflow.some(({ suffix }) => navPathActive(pathname, locale, suffix));

  const openMore = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMoreOpen(true);
  };
  const closeMore = () => {
    closeTimer.current = setTimeout(() => setMoreOpen(false), 120);
  };

  useEffect(() => {
    if (!moreOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [moreOpen]);

  const linkBase =
    "relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35 sm:rounded-full";

  const linkActive =
    `${linkBase} text-[#1e293b] after:pointer-events-none after:absolute after:inset-x-2 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-[#d4af37] sm:after:hidden sm:bg-[#1e293b] sm:text-white`;
  const linkIdle = `${linkBase} text-slate-600 hover:text-[#1e293b] sm:hover:bg-slate-50`;

  const moreButtonClass =
    moreSectionActive || moreOpen
      ? `${linkBase} flex items-center gap-1 text-[#1e293b] sm:bg-[#1e293b] sm:text-white`
      : `${linkBase} flex items-center gap-1 text-slate-600 hover:text-[#1e293b] sm:hover:bg-slate-50`;

  return (
    <nav
      className={[
        "flex flex-wrap items-center justify-center gap-1 sm:inline-flex sm:rounded-full sm:px-1 sm:py-1 sm:transition-[background-color,border-color,box-shadow,backdrop-filter] sm:duration-300",
        scrolled
          ? "sm:border sm:border-slate-200/90 sm:bg-white/82 sm:backdrop-blur-md"
          : "sm:border sm:border-transparent sm:bg-transparent",
      ].join(" ")}
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
        <div ref={moreWrapRef} className="relative" onMouseEnter={openMore} onMouseLeave={closeMore}>
          <button
            type="button"
            className={moreButtonClass}
            aria-expanded={moreOpen}
            aria-haspopup="true"
            aria-controls={menuId}
          >
            <span className="sr-only">{dict.nav.more}</span>
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
            className="absolute left-0 top-[calc(100%+0.35rem)] z-50 min-w-44 rounded-xl border border-slate-200/95 bg-white py-1"
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
                  onClick={() => {
                    setMoreOpen(false);
                    if (closeTimer.current) clearTimeout(closeTimer.current);
                  }}
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
