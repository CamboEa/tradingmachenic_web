import Image from "next/image";
import Link from "next/link";

import type { EducationCategory } from "@/lib/education-categories";
import type { Dictionary, Locale } from "@/lib/i18n";
import { educationMentorHref, type Mentor } from "@/lib/mentors";

export function MentorCard({
  mentor,
  category,
  locale,
  dict,
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
  const bio = mentor.bios[locale];

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-bridge bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal/10 hover:border-teal/40">
      <Link
        href={href}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/50 focus-visible:ring-offset-2"
      >
        {/* Full-image banner — image only, no text overlay */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-brand">
          {mentor.imageUrl ? (
            <Image
              src={mentor.imageUrl}
              alt={name}
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal/20 to-slate-brand">
              <span className="text-6xl font-black text-white/30">{name.charAt(0)}</span>
            </div>
          )}
        </div>

        {/* Card body — text moved below the image */}
        <div className="flex flex-1 flex-col px-4 pt-3 pb-0 text-center">
          {/* Name + title */}
          <h3 className="text-sm font-bold tracking-tight text-foreground sm:text-base">{name}</h3>
          {title ? (
            <p className="mt-0.5 text-xs font-medium text-teal">{title}</p>
          ) : null}

          {/* Bio */}
          {bio ? (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-muted">{bio}</p>
          ) : null}

          <div className="flex-1" />
        </div>

        {/* CTA */}
        <div className="mt-3 border-t border-bridge/40 p-3">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-teal/20 transition-all duration-200 group-hover:bg-sky-600 group-hover:shadow-md">
            {dict.course.viewMentorLessons}
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden>
              <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </Link>
    </article>
  );
}
