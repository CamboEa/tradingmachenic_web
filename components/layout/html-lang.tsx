"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { defaultLocale, isLocale } from "@/lib/i18n";

export function HtmlLang() {
 const pathname = usePathname();
 const segment = pathname.split("/").filter(Boolean)[0];
 const lang = isLocale(segment) ? segment : defaultLocale;

 useEffect(() => {
 document.documentElement.lang = lang;
 }, [lang]);

 return null;
}
