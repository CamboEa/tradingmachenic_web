import Link from "next/link";

import type { Dictionary, Locale } from "@/lib/i18n";

import { hrefWithLocale } from "./nav-utils";

const seg =
  "rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9]/30";

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
      className="flex shrink-0 items-center gap-0.5 rounded-xl border border-slate-200/90 bg-white/85 p-0.5 backdrop-blur"
      role="group"
      aria-label={dict.nav.language}
    >
      <span className="sr-only">{dict.nav.language}</span>
      <Link
        href={hrefWithLocale(pathname, "en")}
        className={
          locale === "en"
            ? `${seg} bg-[#1e293b] text-white`
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
            ? `${seg} bg-[#1e293b] text-white`
            : `${seg} text-slate-500 hover:bg-slate-50 hover:text-[#1e293b]`
        }
        hrefLang="km"
      >
        {dict.nav.khmer}
      </Link>
    </div>
  );
}
