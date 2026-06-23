import Image from "next/image";
import Link from "next/link";

import type { EducationCategory } from "@/lib/education-categories";
import type { Dictionary, Locale } from "@/lib/i18n";
import { educationMentorHref, type Mentor } from "@/lib/mentors";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.94 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.25 4a.75.75 0 0 1 0 1.08l-4.25 4a.75.75 0 0 1-1.06-.02Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function MentorCard({
  mentor,
  category,
  locale,
  dict,
  lessonCount,
}: {
  mentor: Mentor;
  category: EducationCategory;
  locale: Locale;
  dict: Dictionary;
  lessonCount: number;
}) {
  const href = educationMentorHref(locale, category, mentor.slug);
  const name = mentor.names[locale];
  const title = mentor.titles[locale];
  const countLabel = dict.course.lessonCount.replace("{count}", String(lessonCount));

  return (
    <article>
      <Link
        href={href}
        className="group relative flex w-full min-h-[7.5rem] items-center gap-5 overflow-hidden rounded-xl border border-bridge/35 bg-white p-6 shadow-sm transition duration-200 hover:border-gold/45 hover:shadow-md hover:shadow-teal/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 sm:min-h-[9rem] sm:gap-6 sm:p-8"
      >
        <span
          aria-hidden
          className="absolute inset-y-0 left-0 w-0.5 bg-gold/50 transition group-hover:bg-gold"
        />

        <div className="relative ml-1 h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-surface-soft ring-1 ring-bridge/25 sm:h-32 sm:w-32">
          {mentor.imageUrl ? (
            <Image
              src={mentor.imageUrl}
              alt={name}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="128px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-surface-soft to-bridge/25 text-xl font-semibold text-teal/40 sm:text-2xl">
              {name.charAt(0)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold tracking-tight text-teal transition group-hover:text-gold sm:text-xl">
            {name}
          </h3>
          <p className="mt-1.5 line-clamp-1 text-base leading-snug text-ink-muted sm:line-clamp-none sm:text-lg">
            {title}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-gold/90 sm:text-sm">
            {countLabel}
          </p>
        </div>

        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-bridge/30 text-bridge transition group-hover:border-teal/30 group-hover:bg-surface-soft group-hover:text-teal sm:h-14 sm:w-14">
          <ChevronIcon className="h-6 w-6" />
        </span>
      </Link>
    </article>
  );
}
