"use client";

import { useMemo, useState } from "react";

import { CourseLessonCard } from "@/components/education/course-lesson-card";
import { Dropdown } from "@/components/ui/dropdown";
import {
  paginateItems,
  SearchGridPagination,
  totalPagesFor,
} from "@/components/ui/search-grid-pagination";
import type { Lesson } from "@/lib/course";
import type { Dictionary, Locale } from "@/lib/i18n";

type Filter = "all" | "free" | "paid";

const ITEMS_PER_PAGE = 9;

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
  const [page, setPage] = useState(0);

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

  const totalPages = totalPagesFor(filtered.length, ITEMS_PER_PAGE);
  const paginated = paginateItems(filtered, page, ITEMS_PER_PAGE);

  return (
    <>

      {/* Search + filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative w-full max-w-sm">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden
          >
            <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder={dict.course.searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 shadow-sm outline-none transition focus:border-(--color-teal) focus:ring-2 focus:ring-teal/20"
          />
        </div>

        <Dropdown
          value={filter}
          options={[
            { value: "all",  label: dict.course.filterAll  },
            { value: "free", label: dict.course.filterFree },
            { value: "paid", label: dict.course.filterPaid },
          ]}
          onChange={(value) => {
            setFilter(value);
            setPage(0);
          }}
        />
      </div>

      {/* Results count when searching */}
      {query && (
        <p className="mt-4 text-xs text-(--color-ink-soft)">
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-slate-400" aria-hidden>
              <circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-(--color-ink-muted)">{dict.course.noLessonsMatch}</p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {paginated.map((lesson) => {
              const index = lessons.findIndex((l) => l.slug === lesson.slug);
              return (
                <CourseLessonCard
                  key={lesson.slug}
                  lesson={lesson}
                  locale={locale}
                  index={index >= 0 ? index : 0}
                  total={lessons.length}
                  dict={dict}
                />
              );
            })}
          </div>
          <SearchGridPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </>
  );
}
