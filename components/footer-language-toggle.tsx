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

export function FooterLanguageToggle({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const pathname = usePathname() ?? `/${locale}`;
  const n = dict.nav;
  const seg =
    "rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition";

  return (
    <div
      className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-0.5"
      role="group"
      aria-label={n.language}
    >
      {locales.map((loc) => (
        <Link
          key={loc}
          href={hrefWithLocale(pathname, loc)}
          hrefLang={loc}
          className={
            locale === loc
              ? `${seg} bg-white/15 text-white`
              : `${seg} text-slate-400 hover:bg-white/10 hover:text-white`
          }
          aria-current={locale === loc ? "true" : undefined}
        >
          {loc === "en" ? n.english : n.khmer}
        </Link>
      ))}
    </div>
  );
}
