"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import type { Dictionary, Locale } from "@/lib/i18n";

const HERO_VIDEO = "/video/herosectionvideo.mp4";

export function HomeHeroSplit({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const h = dict.home;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  // Content entrance animation
  useEffect(() => {
    const els = [headingRef, subRef, ctaRef];
    els.forEach((ref, i) => {
      const el = ref.current;
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(24px)";
      el.style.transition = `opacity 0.7s ease ${i * 120}ms, transform 0.7s ease ${i * 120}ms`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        });
      });
    });
  }, []);


  return (
    <section
      className="relative h-[calc(100dvh-var(--site-chrome-top))] min-h-[calc(100dvh-var(--site-chrome-top))] overflow-hidden bg-(--color-slate-brand)"
      aria-labelledby="home-hero-heading"
    >
      {/* Background video — loops continuously */}
      <video
        src={HERO_VIDEO}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[rgba(8,15,30,0.72)]" aria-hidden />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_70%,color-mix(in_oklab,#22332E_14%,transparent),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,color-mix(in_oklab,#629696_8%,transparent),transparent)]"
        aria-hidden
      />

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">

        {/* Decorative label */}
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px w-8" style={{ backgroundColor: "color-mix(in oklab, var(--gold) 50%, transparent)" }} aria-hidden />
          <span className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: "var(--gold)" }}>
            FIN HUB KH Academy
          </span>
          <span className="h-px w-8" style={{ backgroundColor: "color-mix(in oklab, var(--gold) 50%, transparent)" }} aria-hidden />
        </div>

        {/* Headline — last word uses brand accent */}
        <h1
          ref={headingRef}
          id="home-hero-heading"
          className="max-w-4xl text-balance text-4xl font-black uppercase leading-[1.06] tracking-[0.03em] text-white drop-shadow-[0_2px_24px_rgba(255,255,255,0.08)] sm:text-5xl lg:text-[4rem] xl:text-[4.75rem]"
        >
          {(() => {
            const words = h.heroSplitHeadline.split(" ");
            const last = words[words.length - 1];
            const rest = words.slice(0, -1).join(" ");
            return (
              <>
                {rest}{" "}
                <span style={{ color: "var(--gold)" }}>{last}</span>
              </>
            );
          })()}
        </h1>

        {/* Decorative divider */}
        <div className="mt-7 flex items-center gap-2" aria-hidden>
          <span className="h-px w-10 bg-linear-to-r from-transparent to-white/15" />
          <span className="h-1 w-1 rounded-full bg-teal/50" />
          <span className="h-px w-16 bg-surface/10" />
          <span className="h-1.5 w-1.5 rounded-full bg-(--color-gold)/60" />
          <span className="h-px w-16 bg-surface/10" />
          <span className="h-1 w-1 rounded-full bg-teal/50" />
          <span className="h-px w-10 bg-linear-to-l from-transparent to-white/15" />
        </div>

        {/* Sub */}
        <p
          ref={subRef}
          className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-300/90 sm:text-[1.05rem]"
        >
          {h.heroSplitSubhead}
        </p>

        {/* CTAs */}
        <div
          ref={ctaRef}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href={`/${locale}/register`}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-teal px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_8px_32px_rgba(27,58,53,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(27,58,53,0.50)]"
          >
            <span className="relative z-10">{h.heroSplitCta}</span>
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
            <span className="absolute inset-0 -translate-x-full bg-surface/10 transition-transform duration-500 group-hover:translate-x-0" aria-hidden />
          </Link>

          <Link
            href={`/${locale}/curriculum`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-surface/5 px-8 py-3.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-surface/10 hover:text-white"
          >
            {h.ctaOutline}
          </Link>
        </div>

        {/* Stat strip */}
        <div className="mt-14 flex items-center gap-6 sm:gap-10">
          {dict.home.stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-lg font-bold text-white sm:text-xl">{stat.value}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.22em] text-white/30">Scroll</span>
        <div className="relative h-8 w-px overflow-hidden bg-surface/10">
          <span
            className="absolute inset-x-0 top-0 h-full bg-linear-to-b from-transparent via-white/60 to-transparent"
            style={{ animation: "scrollLine 1.6s ease-in-out infinite" }}
            aria-hidden
          />
        </div>
      </div>

      <style>{`
        @keyframes scrollLine {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        @keyframes kenBurns {
          from { transform: scale(1)    translate(0,    0); }
          to   { transform: scale(1.08) translate(-1%, -0.5%); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes kenBurns {
            from, to { transform: scale(1) translate(0, 0); }
          }
        }
      `}</style>
    </section>
  );
}
