"use client";

import { useMemo, useState } from "react";

import { CourseLessonCard } from "@/components/course-lesson-card";
import type { Lesson } from "@/lib/course";
import type { Dictionary, Locale } from "@/lib/i18n";

type Filter = "all" | "free" | "paid";

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
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return lessons.filter((lesson) => {
      if (filter !== "all" && lesson.type !== filter) return false;
      if (!q) return true;
      const title = lesson.titles[locale].toLowerCase();
      const summary = lesson.summaries[locale].toLowerCase();
      return title.includes(q) || summary.includes(q) || lesson.slug.toLowerCase().includes(q);
    });
  }, [lessons, query, filter, locale]);

  const total = lessons.length;

  return (
    <>
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.course.searchPlaceholder}
          className="w-full max-w-md rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20"
        />
        <div className="flex flex-wrap gap-2">
          {(["all", "free", "paid"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={[
                "rounded-lg px-3.5 py-2 text-xs font-semibold capitalize transition",
                filter === f
                  ? "bg-[#0ea5e9] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[#0ea5e9]",
              ].join(" ")}
            >
              {f === "all" ? dict.course.filterAll : f === "free" ? dict.course.filterFree : dict.course.filterPaid}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-sm text-slate-500">{dict.course.noLessonsMatch}</p>
      ) : (
        <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((lesson) => {
            const index = lessons.findIndex((l) => l.slug === lesson.slug);
            return (
              <CourseLessonCard
                key={lesson.slug}
                lesson={lesson}
                locale={locale}
                index={index >= 0 ? index : 0}
                total={total}
                dict={dict}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
