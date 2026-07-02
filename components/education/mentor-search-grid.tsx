"use client";

import { useMemo, useState } from "react";

import type { EducationCategory } from "@/lib/education/categories";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Lesson } from "@/lib/education/course";
import type { Mentor } from "@/lib/education/mentors";

import { MentorCard } from "./mentor-card";

function lessonCountForMentor(
  lessons: Lesson[],
  mentor: Mentor,
  category: EducationCategory,
): number {
  return lessons.filter(
    (lesson) => lesson.mentorSlug === mentor.slug && lesson.category === category,
  ).length;
}

function lessonSearchText(lesson: Lesson): string {
  const videoTitles = lesson.videos.flatMap((video) => [
    video.titles?.en ?? "",
    video.titles?.km ?? "",
  ]);

  return [
    lesson.slug,
    lesson.titles.en,
    lesson.titles.km,
    lesson.summaries.en,
    lesson.summaries.km,
    ...lesson.objectives.en,
    ...lesson.objectives.km,
    ...videoTitles,
  ]
    .join(" ")
    .toLowerCase();
}

function mentorProfileSearchText(mentor: Mentor): string {
  return [
    mentor.names.en,
    mentor.names.km,
    mentor.titles.en,
    mentor.titles.km,
    mentor.bios.en,
    mentor.bios.km,
    mentor.slug,
  ]
    .join(" ")
    .toLowerCase();
}

function buildLessonTextByMentor(
  lessons: Lesson[],
  category: EducationCategory,
): Map<string, string> {
  const map = new Map<string, string>();

  for (const lesson of lessons) {
    if (lesson.category !== category || !lesson.mentorSlug) continue;

    const existing = map.get(lesson.mentorSlug) ?? "";
    map.set(lesson.mentorSlug, `${existing} ${lessonSearchText(lesson)}`.trim());
  }

  return map;
}

export function MentorSearchGrid({
  category,
  locale,
  dict,
  lessons,
  mentors,
}: {
  category: EducationCategory;
  locale: Locale;
  dict: Dictionary;
  lessons: Lesson[];
  mentors: Mentor[];
}) {
  const [query, setQuery] = useState("");

  const lessonTextByMentor = useMemo(
    () => buildLessonTextByMentor(lessons, category),
    [lessons, category],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mentors;

    return mentors.filter((mentor) => {
      const haystack = `${mentorProfileSearchText(mentor)} ${lessonTextByMentor.get(mentor.slug) ?? ""}`;
      return haystack.includes(q);
    });
  }, [mentors, query, lessonTextByMentor]);

  return (
    <div>
      <div className="relative mb-6 max-w-xl">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="search"
          placeholder={dict.course.mentorSearchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-bridge/40 bg-surface py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-ink-soft shadow-sm transition focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-teal/20"
          aria-label={dict.course.mentorSearchPlaceholder}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-bridge/40 px-6 py-16 text-center">
          <p className="text-sm font-medium text-ink-muted">{dict.course.noMentorsMatch}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5">
          {filtered.map((mentor) => (
            <MentorCard
              key={mentor.slug}
              mentor={mentor}
              category={category}
              locale={locale}
              dict={dict}
              lessonCount={lessonCountForMentor(lessons, mentor, category)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
