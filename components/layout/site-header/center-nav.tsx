"use client";

import Link from "next/link";
import { useState } from "react";

import {
  educationCategoryHref,
  educationCategorySlugs,
  type EducationCategory,
} from "@/lib/education-categories";
import type { Dictionary, Locale } from "@/lib/i18n";

import { navPathActive } from "./nav-utils";

const navBase =
  "relative inline-flex h-9 items-center whitespace-nowrap rounded-md px-2 text-[13px] font-semibold uppercase leading-none tracking-[0.05em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30";
const navActive = `${navBase} text-foreground`;
const navIdle   = `${navBase} text-ink-soft hover:text-foreground`;

const categoryLabelKey: Record<EducationCategory, keyof Dictionary["nav"]> = {
  forex: "educationForex",
  stock: "educationStock",
  crypto: "educationCrypto",
  siac: "educationSiac",
};

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className ?? "h-3.5 w-3.5 shrink-0 opacity-70"}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EducationDropdown({
  locale,
  dict,
  pathname,
  isActive,
}: {
  locale: Locale;
  dict: Dictionary;
  pathname: string;
  isActive: boolean;
}) {
  const categories = educationCategorySlugs.map((slug) => ({
    slug,
    label: dict.nav[categoryLabelKey[slug]],
    href: educationCategoryHref(locale, slug),
  }));

  return (
    <div className="group relative">
      <Link
        href={`/${locale}/education`}
        aria-current={isActive ? "page" : undefined}
        aria-haspopup="menu"
        className={`${isActive ? navActive : navIdle} gap-1`}
      >
        {dict.nav.education}
        <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-150 group-hover:rotate-180" />
        {isActive && (
          <span
            aria-hidden
            className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-gold"
          />
        )}
      </Link>

      <div
        className="pointer-events-none absolute left-0 top-full z-50 pt-1 opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
        role="menu"
        aria-label={dict.nav.education}
      >
        <div className="min-w-[9.5rem] overflow-hidden rounded-lg border border-bridge/40 bg-surface py-1 shadow-lg shadow-black/25">
          {categories.map(({ slug, label, href }) => {
            const subActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={slug}
                href={href}
                role="menuitem"
                className={`block px-4 py-2.5 text-[13px] font-semibold uppercase tracking-[0.05em] transition-colors ${
                  subActive
                    ? "bg-surface-soft text-foreground"
                    : "text-ink-soft hover:bg-surface-soft hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EducationMobileSection({
  locale,
  dict,
  pathname,
  isActive,
}: {
  locale: Locale;
  dict: Dictionary;
  pathname: string;
  isActive: boolean;
}) {
  const [open, setOpen] = useState(isActive);

  const categories = educationCategorySlugs.map((slug) => ({
    slug,
    label: dict.nav[categoryLabelKey[slug]],
    href: educationCategoryHref(locale, slug),
  }));

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between border-l-2 px-5 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
          isActive
            ? "border-gold bg-gold/10 text-foreground"
            : "border-transparent text-ink-soft hover:border-bridge/40 hover:bg-surface-soft hover:text-foreground"
        }`}
      >
        <span>{dict.nav.education}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-l-2 border-bridge/30 bg-surface-soft/50 py-1">
          <Link
            href={`/${locale}/education`}
            className={`block py-2.5 pl-8 pr-5 text-sm font-medium transition-colors ${
              pathname === `/${locale}/education` || pathname === `/${locale}/education/`
                ? "text-foreground"
                : "text-ink-soft hover:text-foreground"
            }`}
          >
            {dict.nav.education}
          </Link>
          {categories.map(({ slug, label, href }) => {
            const subActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={slug}
                href={href}
                className={`block py-2.5 pl-8 pr-5 text-sm font-medium transition-colors ${
                  subActive ? "text-foreground" : "text-ink-soft hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
    { suffix: "curriculum",          label: dict.nav.curriculum,       href: `/${locale}/curriculum` },
    { suffix: "tools",               label: dict.nav.tools,            href: `/${locale}/tools` },
    { suffix: "podcast",             label: dict.nav.podcast,          href: `/${locale}/podcast` },
    // Temporarily hidden: blog, technical-analysis
    // { suffix: "blog",                label: dict.nav.blog,             href: `/${locale}/blog` },
    // { suffix: "technical-analysis",  label: dict.nav.technicalAnalysis, href: `/${locale}/technical-analysis` },
    { suffix: "about",               label: dict.nav.about,            href: `/${locale}/about` },
  ];

  const educationActive = navPathActive(pathname, locale, "education");

  /* ── Mobile: full vertical list ── */
  if (mobile) {
    return (
      <nav aria-label="Primary" className="flex flex-col py-1">
        <Link
          href={`/${locale}`}
          aria-current={navPathActive(pathname, locale, "") ? "page" : undefined}
          className={`flex items-center border-l-2 px-5 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
            navPathActive(pathname, locale, "")
              ? "border-gold bg-gold/10 text-foreground"
              : "border-transparent text-ink-soft hover:border-bridge/40 hover:bg-surface-soft hover:text-foreground"
          }`}
        >
          {dict.nav.home}
        </Link>

        <EducationMobileSection
          locale={locale}
          dict={dict}
          pathname={pathname}
          isActive={educationActive}
        />

        {items.filter((item) => item.suffix !== "").map(({ suffix, label, href }) => {
          const isActive = navPathActive(pathname, locale, suffix);
          return (
            <Link
              key={suffix}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center border-l-2 px-5 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
                isActive
                  ? "border-gold bg-gold/10 text-foreground"
                  : "border-transparent text-ink-soft hover:border-bridge/40 hover:bg-surface-soft hover:text-foreground"
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
    <nav aria-label="Primary" className="flex min-w-0 items-center justify-center gap-0.5">
      <Link
        href={`/${locale}`}
        aria-current={navPathActive(pathname, locale, "") ? "page" : undefined}
        className={navPathActive(pathname, locale, "") ? navActive : navIdle}
      >
        {dict.nav.home}
        {navPathActive(pathname, locale, "") && (
          <span
            aria-hidden
            className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-gold"
          />
        )}
      </Link>

      <EducationDropdown
        locale={locale}
        dict={dict}
        pathname={pathname}
        isActive={educationActive}
      />

      {items.filter((item) => item.suffix !== "").map(({ suffix, label, href }) => {
        const isActive = navPathActive(pathname, locale, suffix);
        return (
          <Link
            key={suffix}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={isActive ? navActive : navIdle}
          >
            {label}
            {isActive && (
              <span
                aria-hidden
                className="absolute inset-x-2 bottom-1 h-0.5 rounded-full bg-gold"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
