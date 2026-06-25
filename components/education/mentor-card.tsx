import Image from "next/image";
import Link from "next/link";

import type { EducationCategory } from "@/lib/education-categories";
import { categoryNavKeys } from "@/lib/education-category-meta";
import type { Dictionary, Locale } from "@/lib/i18n";
import { educationMentorHref, type Mentor } from "@/lib/mentors";

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
  const bio = mentor.bios[locale];
  const countLabel = dict.course.lessonCount.replace("{count}", String(lessonCount));
  const ctaLabel = dict.course.mentorLessons.replace("{mentor}", name);
  const categoryLabel = dict.nav[categoryNavKeys[category]];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-bridge/40 bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-highlight/30 hover:shadow-lg hover:shadow-teal/10">
      <Link
        href={href}
        className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-soft">
          {mentor.imageUrl ? (
            <Image
              src={mentor.imageUrl}
              alt={name}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-bridge/60 via-surface-soft to-slate-brand">
              <span className="text-5xl font-bold text-teal/30">{name.charAt(0)}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute left-3 top-3">
            <span className="rounded-md bg-black/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-highlight backdrop-blur-sm">
              {categoryLabel}
            </span>
          </div>

          <div className="absolute right-3 top-3">
            <span className="rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
              {countLabel}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-10">
            <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">{name}</h3>
            <p className="mt-0.5 line-clamp-1 text-sm text-white/75">{title}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-ink-soft">{bio}</p>
          <div className="mt-4 flex items-center justify-end border-t border-bridge/30 pt-4">
            <span className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-teal ring-1 ring-teal/30 transition-all group-hover:bg-teal group-hover:text-white group-hover:ring-transparent">
              {ctaLabel}
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
