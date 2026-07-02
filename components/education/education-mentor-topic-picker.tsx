import Image from "next/image";
import Link from "next/link";

import type { EducationCategory } from "@/lib/education/categories";
import type { Dictionary, Locale } from "@/lib/i18n";
import { educationMentorTopicHref } from "@/lib/education/mentors";
import type { LessonTopic } from "@/lib/supabase/lesson-topics";

export function EducationMentorTopicPicker({
  category,
  mentorSlug,
  locale,
  dict,
  topics,
}: {
  category: EducationCategory;
  mentorSlug: string;
  locale: Locale;
  dict: Dictionary;
  topics: Array<{ topic: LessonTopic; lessonCount: number; thumbnail: string | null }>;
}) {
  if (topics.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-bridge/50 bg-surface py-20 text-center">
        <p className="text-sm text-ink-muted">{dict.course.noLessonsForMentor}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map(({ topic, thumbnail }) => {
        const title = topic.names[locale] || topic.names.en;
        const description = topic.descriptions[locale] || topic.descriptions.en;
        const href = educationMentorTopicHref(locale, category, mentorSlug, topic.slug);
        const startLabel = locale === "km" ? "ចាប់ផ្តើមរៀន" : "Start learning";

        return (
          <Link
            key={topic.id}
            href={href}
            className="group flex flex-col overflow-hidden rounded-2xl border border-bridge/40 bg-surface shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal/35 hover:shadow-lg hover:shadow-teal/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40"
          >
            {thumbnail ? (
              <div className="relative aspect-video w-full overflow-hidden bg-surface-soft border-b border-bridge/20">
                <Image
                  src={thumbnail}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-brand/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ) : null}

            <div className="flex flex-1 flex-col p-5">
              <div className="mb-2 flex items-start justify-between gap-4">
                <h3 className="font-bold text-foreground transition-colors group-hover:text-teal sm:text-lg">
                  {title}
                </h3>
              </div>
              
              <p className="mb-5 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-muted">
                {description || "Explore this trading topic and enhance your market knowledge."}
              </p>
              
              <div className="mt-auto flex items-center justify-between border-t border-bridge/30 pt-4">
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal transition-colors group-hover:text-teal/80">
                  {startLabel}
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                    <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
                  </svg>
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
