import Link from "next/link";

import type { Dictionary, Locale } from "@/lib/i18n";

import { hrefWithLocale } from "./nav-utils";

const seg =
  "inline-flex h-8 items-center rounded-md px-2.5 text-xs font-bold uppercase tracking-wide transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/30";

export function LanguageToggle({
  locale,
  pathname,
  dict,
}: {
  locale: Locale;
  pathname: string;
  dict: Dictionary;
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5"
      role="group"
      aria-label={dict.nav.language}
    >
      <span className="sr-only">{dict.nav.language}</span>
      <Link
        href={hrefWithLocale(pathname, "en")}
        hrefLang="en"
        className={
          locale === "en"
            ? `${seg} bg-slate-brand text-white`
            : `${seg} text-slate-400 hover:text-slate-700`
        }
      >
        {dict.nav.english}
      </Link>
      <Link
        href={hrefWithLocale(pathname, "km")}
        hrefLang="km"
        className={
          locale === "km"
            ? `${seg} bg-slate-brand text-white`
            : `${seg} text-slate-400 hover:text-slate-700`
        }
      >
        {dict.nav.khmer}
      </Link>
    </div>
  );
}
