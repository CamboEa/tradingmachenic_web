"use client";

import Link from "next/link";

import type { Dictionary, Locale } from "@/lib/i18n";

import { navPathActive } from "./nav-utils";

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
  const items = [
    { suffix: "", label: dict.nav.home, href: `/${locale}` },
    { suffix: "education", label: dict.nav.education, href: `/${locale}/education` },
    { suffix: "curriculum", label: dict.nav.curriculum, href: `/${locale}/curriculum` },
    { suffix: "tools", label: dict.nav.tools, href: `/${locale}/tools` },
    { suffix: "podcast", label: dict.nav.podcast, href: `/${locale}/podcast` },
    { suffix: "blog", label: dict.nav.blog, href: `/${locale}/blog` },
    { suffix: "about", label: dict.nav.about, href: `/${locale}/about` },
  ];

  const linkBase =
    "relative whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/35 sm:rounded-full";

  const linkActive =
    `${linkBase} text-[#1e293b] after:pointer-events-none after:absolute after:inset-x-2 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-[#d4af37] sm:after:hidden sm:bg-[#1e293b] sm:text-white`;
  const linkIdle = `${linkBase} text-slate-600 hover:text-[#1e293b] sm:hover:bg-slate-50`;

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
      {items.map(({ suffix, label, href }) => {
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
    </nav>
  );
}
