import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_Khmer, Open_Sans } from "next/font/google";

import { HtmlLang } from "@/components/layout/html-lang";
import { ToastProvider } from "@/components/shared/toast-provider";
import { BRAND_NAME } from "@/lib/brand";

import "./globals.css";

/** Matches MetaTrader 5 marketing site: Open Sans + system fallbacks. */
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fontKhmer = Noto_Sans_Khmer({
  variable: "--font-khmer",
  subsets: ["khmer"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
 title: {
 default: BRAND_NAME,
 template: `%s | ${BRAND_NAME}`,
 },
 description:
 "Structured trading education with video lessons on risk, execution, and mindset.",
 icons: {
 icon: "/Logo/logo.png",
 apple: "/Logo/logo.png",
 },
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html
 lang="en"
 suppressHydrationWarning
 className={`${openSans.variable} ${geistMono.variable} ${fontKhmer.variable} font-sans h-full antialiased`}
 >
 <body className="flex min-h-screen flex-col bg-[var(--background)] font-sans text-[var(--foreground)]">
 <HtmlLang />
 <ToastProvider />
 {children}
 </body>
 </html>
 );
}
