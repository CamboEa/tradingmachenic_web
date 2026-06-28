import { headers } from "next/headers";

import { NotFoundContent } from "@/components/errors/not-found-content";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

function localeFromPathname(pathname: string): Locale | null {
  const match = pathname.match(/^\/(km|en)(\/|$)/);
  const raw = match?.[1];
  return raw && isLocale(raw) ? raw : null;
}

async function resolveNotFoundLocale(
  params?: Promise<{ locale: string }>,
): Promise<Locale> {
  if (params) {
    const { locale: raw } = await params;
    if (isLocale(raw)) return raw;
  }

  const headerList = await headers();
  for (const key of ["x-invoke-path", "x-matched-path", "next-url"]) {
    const value = headerList.get(key);
    if (!value) continue;
    const path = value.startsWith("http") ? new URL(value).pathname : value;
    const locale = localeFromPathname(path);
    if (locale) return locale;
  }

  return defaultLocale;
}

export default async function NotFound({
  params,
}: {
  params?: Promise<{ locale: string }>;
}) {
  const locale = await resolveNotFoundLocale(params);
  return <NotFoundContent locale={locale} variant="public" />;
}
