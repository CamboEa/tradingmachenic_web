"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Dictionary, Locale } from "@/lib/i18n";

const BG_IMAGES = [
  "/Images/hero.png",
  "/Images/bg-about-header.png",
];

const SLIDE_INTERVAL_MS = 5000;

export function HomeHeroSplit({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const h = dict.home;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

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

  // Background carousel
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % BG_IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      className="relative h-[calc(100dvh-var(--site-chrome-top))] min-h-[calc(100dvh-var(--site-chrome-top))] overflow-hidden bg-(--color-slate-brand)"
      aria-labelledby="home-hero-heading"
    >
      {/* Background carousel — Ken Burns zoom + cross-fade */}
      {BG_IMAGES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          aria-hidden
          className={`object-cover object-center transition-opacity duration-1500 ease-in-out ${
            i === activeIdx ? "opacity-100" : "opacity-0"
          }`}
          style={
            i === activeIdx
              ? { animation: "kenBurns 7s ease-out forwards" }
              : { animation: "none", transform: "scale(1) translate(0,0)" }
          }
        />
      ))}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[rgba(8,15,30,0.72)]" aria-hidden />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_70%,color-mix(in_oklab,#1E3EE8_14%,transparent),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,color-mix(in_oklab,#4B78F8_8%,transparent),transparent)]"
        aria-hidden
      />

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">

        {/* Decorative label */}
        <div className="mb-5 flex items-center gap-3">
          <span className="h-px w-8 bg-[#4B78F8]/40" aria-hidden />
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#4B78F8]/70">
            FIN HUB KH Academy
          </span>
          <span className="h-px w-8 bg-[#4B78F8]/40" aria-hidden />
        </div>

        {/* Headline — last word in gold gradient */}
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
                <span className="bg-linear-to-r from-[#7BA8FF] via-[#C8D9FF] to-[#7BA8FF] bg-clip-text text-transparent">
                  {last}
                </span>
              </>
            );
          })()}
        </h1>

        {/* Decorative divider */}
        <div className="mt-7 flex items-center gap-2" aria-hidden>
          <span className="h-px w-10 bg-linear-to-r from-transparent to-white/15" />
          <span className="h-1 w-1 rounded-full bg-[#1E3EE8]/50" />
          <span className="h-px w-16 bg-white/10" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#4B78F8]/60" />
          <span className="h-px w-16 bg-white/10" />
          <span className="h-1 w-1 rounded-full bg-[#1E3EE8]/50" />
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
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#1E3EE8] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_8px_32px_rgba(30,62,232,0.35)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(30,62,232,0.50)]"
          >
            <span className="relative z-10">{h.heroSplitCta}</span>
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" aria-hidden>→</span>
            <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0" aria-hidden />
          </Link>

          <Link
            href={`/${locale}/curriculum`}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white/90 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10 hover:text-white"
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
        <div className="relative h-8 w-px overflow-hidden bg-white/10">
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
