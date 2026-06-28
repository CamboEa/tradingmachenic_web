import type { Metadata } from "next";
import {
  Barlow,
  Barlow_Condensed,
  Geist_Mono,
  Kantumruy_Pro,
  Noto_Sans_Khmer,
} from "next/font/google";

import { ThemeProvider } from "@/components/shared/theme-provider";
import { ToastProvider } from "@/components/shared/toast-provider";
import { BRAND_NAME } from "@/lib/brand";

import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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

const fontKhmerTitle = Kantumruy_Pro({
  variable: "--font-khmer-title",
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
 title: {
 default: BRAND_NAME,
 template: `%s | ${BRAND_NAME}`,
 },
 description:
 "Structured trading education with video lessons on risk, execution, and mindset.",
 icons: {
 icon: "/Logo/logov3.png",
 apple: "/Logo/logov3.png",
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
 className={`${barlow.variable} ${barlowCondensed.variable} ${geistMono.variable} ${fontKhmer.variable} ${fontKhmerTitle.variable} font-sans h-full antialiased`}
 >
 <body className="flex min-h-screen flex-col bg-background font-sans text-foreground">
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
   <ToastProvider />
   {children}
  </ThemeProvider>
 </body>
 </html>
 );
}
