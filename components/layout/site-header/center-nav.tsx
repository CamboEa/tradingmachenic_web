"use client";

import Link from "next/link";

import type { Dictionary, Locale } from "@/lib/i18n";

import { navPathActive } from "./nav-utils";

const navBase =
  "relative whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[13px] font-semibold tracking-tight transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30";
const navActive = `${navBase} text-slate-900`;
const navIdle   = `${navBase} text-slate-500 hover:text-slate-800`;

export function CenterNav({
  locale,
  dict,
  pathname,
  mobile = false,
}: {
  locale: Locale;
  dict: Dictionary;
  pathname: string;
  mobile?: boolean;
}) {
  const items = [
    { suffix: "",                    label: dict.nav.home,             href: `/${locale}` },
    { suffix: "education",           label: dict.nav.education,        href: `/${locale}/education` },
    { suffix: "curriculum",          label: dict.nav.curriculum,       href: `/${locale}/curriculum` },
    { suffix: "tools",               label: dict.nav.tools,            href: `/${locale}/tools` },
    { suffix: "podcast",             label: dict.nav.podcast,          href: `/${locale}/podcast` },
    { suffix: "blog",                label: dict.nav.blog,             href: `/${locale}/blog` },
    { suffix: "technical-analysis",  label: dict.nav.technicalAnalysis, href: `/${locale}/technical-analysis` },
    { suffix: "about",               label: dict.nav.about,            href: `/${locale}/about` },
  ];

  /* ── Mobile: full vertical list ── */
  if (mobile) {
    return (
      <nav aria-label="Primary" className="flex flex-col py-1">
        {items.map(({ suffix, label, href }) => {
          const isActive = navPathActive(pathname, locale, suffix);
          return (
            <Link
              key={suffix || "home"}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center border-l-2 px-5 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-gold bg-amber-50/40 text-slate-900"
                  : "border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  /* ── Desktop: all items inline ── */
  return (
    <nav aria-label="Primary" className="flex items-center gap-0">
      {items.map(({ suffix, label, href }) => {
        const isActive = navPathActive(pathname, locale, suffix);
        return (
          <Link
            key={suffix || "home"}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={isActive ? navActive : navIdle}
          >
            {label}
            {isActive && (
              <span
                aria-hidden
                className="absolute inset-x-1.5 bottom-0 h-0.5 rounded-full bg-gold"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
