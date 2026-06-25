"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { Lesson } from "@/lib/course";
import { getLessonThumbnailSrc, lessonVideoCount } from "@/lib/course";
import type { Dictionary, Locale } from "@/lib/i18n";

/* ── Small Netflix-style card (for horizontal rows) ──────────────────── */

function RowCard({ lesson, locale, index, dict }: {
  lesson: Lesson; locale: Locale; index: number; dict: Dictionary;
}) {
  const href       = `/${locale}/education/${lesson.slug}`;
  const thumbSrc   = getLessonThumbnailSrc(lesson);
  const title      = lesson.titles[locale];
  const isFree     = lesson.type === "free";
  const videoCount = lessonVideoCount(lesson);

  return (
    <Link
      href={href}
      className="group relative flex w-56 shrink-0 flex-col overflow-hidden rounded-xl bg-surface shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40 sm:w-64"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
        {thumbSrc ? (
          <Image src={thumbSrc} alt="" fill sizes="256px" className="object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-slate-700 to-slate-900">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-white/20" aria-hidden>
              <path d="M8 5.14v14l11-7-11-7Z" />
            </svg>
          </div>
        )}
        {/* Gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent" />

        {/* Video count */}
        {videoCount > 0 && (
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
            <svg width="6" height="7" viewBox="0 0 6 7" fill="currentColor" aria-hidden><polygon points="0,0 6,3.5 0,7"/></svg>
            {videoCount}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-gold">
          {title}
        </h3>
        <div className="mt-auto flex items-center justify-between">
          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
            isFree ? "bg-teal/20 text-teal" : "bg-gold/20 text-gold"
          }`}>
            {isFree ? dict.course.filterFree : dict.course.filterPaid}
          </span>
          <span className="text-[10px] tabular-nums text-white/40">{lesson.approximateMinutes} min</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Featured hero (first / highlighted lesson) ───────────────────────── */

function FeaturedHero({ lesson, locale, index, dict }: {
  lesson: Lesson; locale: Locale; index: number; dict: Dictionary;
}) {
  const href       = `/${locale}/education/${lesson.slug}`;
  const thumbSrc   = getLessonThumbnailSrc(lesson);
  const title      = lesson.titles[locale];
  const summary    = lesson.summaries[locale];
  const isFree     = lesson.type === "free";
  const videoCount = lessonVideoCount(lesson);
  const num        = String(index + 1).padStart(2, "0");

  return (
    <div className="relative mb-10 overflow-hidden rounded-2xl bg-surface shadow-2xl shadow-black/20">
      {/* Background image */}
      {thumbSrc ? (
        <div className="absolute inset-0">
          <Image src={thumbSrc} alt="" fill className="object-cover opacity-40" priority />
        </div>
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-surface-soft to-background" />
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-slate-900/80 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 to-transparent" />

      {/* Content */}
      <div className="relative px-8 py-10 sm:px-12 sm:py-14">
        {/* Eyebrow */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold/70">
            {dict.course.lessonProgress?.split("{current}")[0]?.trim() || "Lesson"} {num}
          </span>
          <span className="h-px w-8 bg-gold/30" aria-hidden />
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            isFree ? "bg-teal/20 text-teal" : "bg-gold/20 text-gold"
          }`}>
            {isFree ? dict.course.filterFree : dict.course.filterPaid}
          </span>
        </div>

        <h2 className="max-w-xl text-2xl font-black leading-tight text-white sm:text-3xl lg:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400 sm:text-base">
          {summary}
        </p>

        {/* Meta */}
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-ink-soft" aria-hidden>
              <path fillRule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clipRule="evenodd"/>
            </svg>
            {lesson.approximateMinutes} min
          </span>
          {videoCount > 0 && (
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-ink-soft" aria-hidden>
                <path d="M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.267a1.5 1.5 0 0 1 0 2.532l-6.706 4.268A1.5 1.5 0 0 1 3 12.267V3.732Z"/>
              </svg>
              {videoCount} video{videoCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          href={href}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-teal px-7 py-3 text-sm font-bold text-white shadow-lg shadow-teal/20 transition duration-200 hover:brightness-110"
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden>
            <path d="M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.267a1.5 1.5 0 0 1 0 2.532l-6.706 4.268A1.5 1.5 0 0 1 3 12.267V3.732Z"/>
          </svg>
          {dict.course.openLesson}
        </Link>
      </div>
    </div>
  );
}

/* ── Horizontal lesson row ────────────────────────────────────────────── */

function LessonRow({ title, accent, lessons, locale, allLessons, dict }: {
  title: string; accent: string;
  lessons: Lesson[]; locale: Locale;
  allLessons: Lesson[]; dict: Dictionary;
}) {
  if (lessons.length === 0) return null;
  return (
    <section className="mb-10">
      {/* Row header */}
      <div className="mb-4 flex items-center gap-3">
        <div className={`h-5 w-1 shrink-0 rounded-full ${accent}`} aria-hidden />
        <h2 className="text-base font-bold uppercase tracking-[0.15em] text-white">{title}</h2>
        <span className="ml-1 text-xs text-ink-soft">({lessons.length})</span>
      </div>

      {/* Horizontal scroll */}
      <div
        className="flex gap-4 overflow-x-auto pb-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {lessons.map((lesson) => {
          const idx = allLessons.findIndex(l => l.slug === lesson.slug);
          return (
            <RowCard
              key={lesson.slug}
              lesson={lesson}
              locale={locale}
              index={idx >= 0 ? idx : 0}
              dict={dict}
            />
          );
        })}
      </div>
    </section>
  );
}

/* ── Main export ──────────────────────────────────────────────────────── */

export function EducationLessonGrid({
  lessons,
  locale,
  dict,
}: {
  lessons: Lesson[];
  locale: Locale;
  dict: Dictionary;
}) {
  const [query, setQuery] = useState("");

  const free = useMemo(() => lessons.filter(l => l.type === "free"),  [lessons]);
  const paid = useMemo(() => lessons.filter(l => l.type === "paid"),  [lessons]);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return lessons.filter(l =>
      l.titles[locale].toLowerCase().includes(q) ||
      l.summaries[locale].toLowerCase().includes(q)
    );
  }, [lessons, query, locale]);

  const featured = free[0] ?? lessons[0];

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-10">

      {/* Search bar */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-sm">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={dict.course.searchPlaceholder}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 outline-none backdrop-blur transition focus:border-teal focus:ring-2 focus:ring-teal/20"
          />
        </div>
      </div>

      {/* Search results */}
      {searched !== null ? (
        <div>
          <p className="mb-4 text-xs text-ink-soft">
            {searched.length} result{searched.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
          {searched.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-ink-soft">{dict.course.noLessonsMatch}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {searched.map(lesson => {
                const idx = lessons.findIndex(l => l.slug === lesson.slug);
                return <RowCard key={lesson.slug} lesson={lesson} locale={locale} index={idx >= 0 ? idx : 0} dict={dict} />;
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Featured hero */}
          {featured && (
            <FeaturedHero
              lesson={featured}
              locale={locale}
              index={lessons.findIndex(l => l.slug === featured.slug)}
              dict={dict}
            />
          )}

          {/* Free row */}
          <LessonRow
            title={locale === "km" ? "មេរៀនឥតគិតថ្លៃ" : "Free Lessons"}
            accent="bg-teal"
            lessons={free}
            locale={locale}
            allLessons={lessons}
            dict={dict}
          />

          {/* Paid row */}
          <LessonRow
            title={locale === "km" ? "មេរៀនបង់ប្រាក់" : "Paid Lessons"}
            accent="bg-gold"
            lessons={paid}
            locale={locale}
            allLessons={lessons}
            dict={dict}
          />

          {/* All lessons if no type split */}
          {free.length === 0 && paid.length === 0 && (
            <LessonRow
              title={locale === "km" ? "មេរៀនទាំងអស់" : "All Lessons"}
              accent="bg-teal"
              lessons={lessons}
              locale={locale}
              allLessons={lessons}
              dict={dict}
            />
          )}
        </>
      )}
    </div>
  );
}
