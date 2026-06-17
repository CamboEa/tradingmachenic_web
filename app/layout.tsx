import type { Metadata } from "next";
import { IBM_Plex_Sans, Geist_Mono, Noto_Sans_Khmer } from "next/font/google";

import { HtmlLang } from "@/components/layout/html-lang";
import { ToastProvider } from "@/components/shared/toast-provider";

import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
 variable: "--font-ibm-plex",
 subsets: ["latin"],
 weight: ["300", "400", "500", "600", "700"],
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
 default: "Algorithmic Alpha Trade",
 template: "%s | Algorithmic Alpha Trade",
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
 lang="km"
 suppressHydrationWarning
 className={`${ibmPlexSans.variable} ${geistMono.variable} ${fontKhmer.variable} font-sans h-full antialiased`}
 >
 <body className="flex min-h-screen flex-col bg-[var(--background)] font-sans text-[var(--foreground)]">
 <HtmlLang />
 <ToastProvider />
 {children}
 </body>
 </html>
 );
}
