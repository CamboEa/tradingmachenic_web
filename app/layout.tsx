import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Khmer } from "next/font/google";

import { HtmlLang } from "@/components/html-lang";
import { ToastProvider } from "@/components/toast-provider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
    default: "Trading Machenic",
    template: "%s | Trading Machenic",
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
      className={`${geistSans.variable} ${geistMono.variable} ${fontKhmer.variable} font-sans h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-[var(--background)] font-sans text-[var(--foreground)]">
        <HtmlLang />
        <ToastProvider />
        {children}
      </body>
    </html>
  );
}
