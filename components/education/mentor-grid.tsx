import type { EducationCategory } from "@/lib/education/categories";
import type { Dictionary, Locale } from "@/lib/i18n";
import type { Lesson } from "@/lib/education/course";
import type { Mentor } from "@/lib/education/mentors";

import { MentorSearchGrid } from "./mentor-search-grid";

export function MentorGrid({
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
  if (mentors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-bridge/50 bg-surface px-6 py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-soft text-highlight">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden>
            <path
              d="M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
              stroke="currentColor"
              strokeWidth="1.75"
            />
            <path
              d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="text-sm font-semibold text-teal">{dict.course.noMentorsYet}</p>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">{dict.course.noMentorsYetHint}</p>
      </div>
    );
  }

  return (
    <MentorSearchGrid
      category={category}
      locale={locale}
      dict={dict}
      lessons={lessons}
      mentors={mentors}
    />
  );
}
