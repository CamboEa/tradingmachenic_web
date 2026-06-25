import Link from "next/link";

import { SiteLogo } from "@/components/shared/site-logo";
import { BRAND_NAME } from "@/lib/brand";
import type { Dictionary, Locale } from "@/lib/i18n";

type FooterLink = { href: string; label: string };

function FooterNavColumn({
 title,
 links,
}: {
 title: string;
 links: FooterLink[];
}) {
 return (
 <div>
 <h2 className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-gold)]">
 {title}
 </h2>
 <ul className="mt-5 space-y-3">
 {links.map(({ href, label }) => (
 <li key={href}>
 <Link
 href={href}
 className="text-sm font-medium text-slate-300 transition hover:text-white"
 >
 {label}
 </Link>
 </li>
 ))}
 </ul>
 </div>
 );
}

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dictionary }) {
 const f = dict.footer;
 const n = dict.nav;
 const year = new Date().getFullYear();
 const base = `/${locale}`;

 const learnLinks: FooterLink[] = [
 { href: base, label: n.home },
 { href: `${base}/education`, label: n.education },
 { href: `${base}/curriculum`, label: n.curriculum },
 ];

  const programLinks: FooterLink[] = [
    { href: `${base}/tools`, label: n.tools },
    { href: `${base}/podcast`, label: n.podcast },
    { href: `${base}/blog`, label: n.blog },
    { href: `${base}/about`, label: n.about },
  ];

 const accountLinks: FooterLink[] = [
 { href: `${base}/register`, label: n.register },
 { href: `${base}/login`, label: n.login },
 ];

 return (
 <footer className="relative mt-auto border-t border-[color-mix(in_oklab,var(--color-gold)_22%,transparent)] bg-[var(--color-slate-brand)] text-white">
 <div
 className="pointer-events-none absolute inset-0 opacity-[0.14]"
 style={{
 backgroundImage: [
 "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 56px)",
 "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 48px)",
 ].join(","),
 }}
 aria-hidden
 />
 <div
 className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,color-mix(in_oklab,var(--color-teal)_18%,transparent),transparent_50%)]"
 aria-hidden
 />

 <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
 <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
 <div className="lg:col-span-5">
 <Link
 href={base}
 className="group inline-flex min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-teal)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-slate-brand)]"
 >
 <SiteLogo size="md"/>
 <span className="min-w-0">
 <span className="block text-lg font-bold tracking-tight text-white transition group-hover:text-slate-100">
 {BRAND_NAME}
 </span>
 <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
 {f.academyLabel}
 </span>
 </span>
 </Link>
 <p className="mt-5 max-w-md text-pretty text-sm leading-relaxed text-slate-300">
 {f.description}
 </p> 
 </div>

 <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7 lg:gap-8">
 <FooterNavColumn title={f.sections.learn} links={learnLinks} />
 <FooterNavColumn title={f.sections.program} links={programLinks} />
 <FooterNavColumn title={f.sections.account} links={accountLinks} />
 </div>
 </div>

 <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
 <p className="max-w-2xl text-xs leading-relaxed text-slate-400">{f.tagline}</p>
 <div className="flex flex-col gap-4 sm:items-end">
 <p className="text-xs text-ink-soft">
 © {year} {f.rights}
 </p>
 </div>
 </div>
 </div>
 </footer>
 );
}
