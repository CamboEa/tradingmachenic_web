"use client";

import { useParams } from "next/navigation";

import { NotFoundContent } from "@/components/errors/not-found-content";
import { defaultLocale, isLocale } from "@/lib/i18n";

export function NotFoundLocale() {
  const params = useParams();
  const raw = params?.locale;
  const locale =
    typeof raw === "string" && isLocale(raw) ? raw : defaultLocale;

  return <NotFoundContent locale={locale} variant="public" />;
}
