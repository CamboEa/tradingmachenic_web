import { locales, type Locale } from "@/lib/i18n";

export function hrefWithLocale(pathname: string, nextLocale: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 0 && locales.includes(parts[0] as Locale)) {
    parts[0] = nextLocale;
  } else {
    parts.unshift(nextLocale);
  }
  return `/${parts.join("/")}`;
}

export function navPathActive(pathname: string, locale: Locale, pathSuffix: string): boolean {
  const base = `/${locale}`;
  if (pathSuffix === "") {
    return pathname === base || pathname === `${base}/`;
  }
  const full = `${base}/${pathSuffix}`;
  return pathname === full || pathname.startsWith(`${full}/`);
}
