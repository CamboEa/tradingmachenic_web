import Image from "next/image";
import Link from "next/link";

import type { Dictionary, Locale } from "@/lib/i18n";
import { SiteLogo } from "@/components/shared/site-logo";

const STUDENT_INITIALS = ["BR", "SK", "MK", "LR", "CN", "TM"] as const;

function RatingStars() {
 return (
 <div className="flex items-center justify-center gap-1.5" aria-hidden>
 {Array.from({ length: 5 }).map((_, i) => (
 <span
 key={i}
 className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[color-mix(in_oklab,var(--color-teal)_35%,var(--color-bridge))] bg-[color-mix(in_oklab,var(--color-teal)_12%,white)]"
 >
 <svg viewBox="0 0 20 20" className="h-5 w-5 text-[var(--color-gold)]" fill="currentColor" aria-hidden>
 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
 </svg>
 </span>
 ))}
 </div>
 );
}

export function HomeHeroSplit({ locale, dict }: { locale: Locale; dict: Dictionary }) {
 const h = dict.home;
 const titleCaps = locale === "en";

 return (
 <>
 <section
 className="relative flex h-[calc(100dvh-var(--site-chrome-top))] min-h-[calc(100dvh-var(--site-chrome-top))] flex-col overflow-hidden bg-[var(--color-slate-brand)] text-white"
 aria-labelledby="home-hero-heading"
 >
 <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
 {/* Left: copy + chart texture */}
 <div className="relative z-20 flex flex-1 flex-col justify-center px-5 py-14 sm:px-8 lg:w-[min(46%,32rem)] lg:flex-none lg:shrink-0 lg:py-20 xl:pl-12">
 <div
 className="pointer-events-none absolute inset-0 opacity-[0.22]"
 style={{
 backgroundImage: [
 "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.05) 38%, transparent 55%)",
 "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 48px)",
 "repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 40px)",
 ].join(","),
 }}
 aria-hidden
 />
 <div className="hero-ambient pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,color-mix(in_oklab,var(--color-teal)_22%,transparent),transparent_55%)] opacity-90" aria-hidden />
 <div className="relative">
 <p className="hero-enter-badge text-xs font-bold uppercase tracking-[0.28em] text-[var(--color-gold)]">
 {dict.course.programStructure}
 </p>
 <h1
 id="home-hero-heading"
 className={[
 "hero-enter-headline mt-5 flex max-w-3xl items-start gap-4 text-pretty pb-4 text-3xl font-bold leading-[1.08] tracking-tight text-white sm:gap-5 sm:pb-5 sm:text-4xl lg:pb-6 lg:text-[2.65rem] lg:leading-[1.05]",
 titleCaps ? "uppercase tracking-[0.04em]" : "",
 ].join(" ")}
 >
 <SiteLogo size="hero" priority className="shrink-0 bg-transparent" />
 <span>{h.heroSplitHeadline}</span>
 </h1>
 <p className="hero-enter-subhead mt-5 max-w-md text-pretty text-base leading-relaxed text-slate-200 sm:text-lg">
 {h.heroSplitSubhead}
 </p>
 <div className="hero-enter-ctas mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
 <Link
 href={`/${locale}/register`}
 className={[
 "inline-flex w-fit items-center justify-center rounded-lg px-8 py-3.5 text-sm font-bold transition hover:-translate-y-0.5",
 titleCaps ? "uppercase tracking-[0.12em]" : "",
 "bg-[var(--color-teal)] text-white hover:brightness-105",
 ].join(" ")}
 >
 {h.heroSplitCta}
 </Link>
 <Link
 href={`/${locale}/curriculum`}
 className="text-sm font-semibold text-slate-200 underline-offset-4 transition hover:text-white hover:underline"
 >
 {h.ctaOutline}
 </Link>
 </div>
 </div>
 </div>

 {/* Right: photo + blend + tab */}
 <div className="hero-enter-photo relative min-h-56 flex-1 sm:min-h-64 lg:min-h-0">
 <div className="relative h-full min-h-[14rem] sm:min-h-[16rem] lg:absolute lg:inset-y-0 lg:left-0 lg:right-0 lg:min-h-full">
 <Image
 src="/Images/hero.png"
 alt={h.heroImageAlt}
 fill
 priority
 sizes="(max-width: 1024px) 100vw, 65vw"
 className="object-cover object-center"
 />
 <div
 className="pointer-events-none absolute inset-y-0 left-0 w-[40%] max-w-[14rem] bg-gradient-to-r from-[var(--color-slate-brand)] via-[color-mix(in_oklab,var(--color-slate-brand)_55%,transparent)] to-transparent sm:max-w-[18rem] lg:w-[38%]"
 aria-hidden
 />
 <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color-mix(in_oklab,var(--color-slate-brand)_55%,transparent)] via-transparent to-transparent opacity-70 sm:opacity-50 lg:opacity-40" aria-hidden />
 </div>
 </div>
 </div>

 <Link
 href={`/${locale}/register`}
 className={[
 "flex w-full items-center justify-center gap-2 py-3 text-center text-xs font-bold text-white transition hover:brightness-105 lg:hidden",
 titleCaps ? "uppercase tracking-[0.14em]" : "",
 "bg-[var(--color-teal)]",
 ].join(" ")}
 >
 {h.heroSplitTab}
 </Link>
 </section> 
 </>
 );
}
