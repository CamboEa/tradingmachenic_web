import Image from "next/image";
import Link from "next/link";

import type { Lesson } from "@/lib/course";
import { getLessonThumbnailSrc, lessonVideoCount } from "@/lib/course";
import type { Dictionary, Locale } from "@/lib/i18n";

export function CourseLessonCard({
  lesson,
  locale,
  index,
  total,
  dict,
}: {
  lesson: Lesson;
  locale: Locale;
  index: number;
  total: number;
  dict: Dictionary;
}) {
  const href       = `/${locale}/education/${lesson.slug}`;
  const thumbSrc   = getLessonThumbnailSrc(lesson);
  const title      = lesson.titles[locale];
  const summary    = lesson.summaries[locale];
  const videoCount = lessonVideoCount(lesson);
  const isFree     = lesson.type === "free";
  const num        = String(index + 1).padStart(2, "0");

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={href} className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40">

        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden bg-slate-800">
          {thumbSrc ? (
            <Image src={thumbSrc} alt="" fill sizes="(max-width:768px)100vw,50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" priority={index === 0} />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-slate-700 to-slate-900" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

          {/* Lesson number */}
          <div className="absolute bottom-3 left-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{dict.course.lessonProgress?.split("{current}")[0]?.trim() || "Lesson"}</span>
            <div className="text-3xl font-black leading-none text-white tabular-nums">{num}</div>
          </div>

          {/* Badges */}
          <div className="absolute right-3 top-3 flex gap-1.5">
            {videoCount > 0 && (
              <span className="flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                <svg width="7" height="8" viewBox="0 0 7 8" fill="currentColor" aria-hidden><polygon points="0,0 7,4 0,8"/></svg>
                {videoCount}
              </span>
            )}
            <span className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm ${isFree ? "bg-teal/80 text-white" : "bg-gold/80 text-slate-900"}`}>
              {isFree ? dict.course.filterFree : dict.course.filterPaid}
            </span>
          </div>

          <span className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
            {lesson.approximateMinutes} min
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-semibold leading-snug text-slate-800 transition-colors group-hover:text-teal">{title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{summary}</p>
          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs tabular-nums text-slate-400">{num} / {String(total).padStart(2,"0")}</span>
            <span className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-teal ring-1 ring-teal/30 transition-all group-hover:bg-teal group-hover:text-white group-hover:ring-transparent">
              {dict.course.openLesson}
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
