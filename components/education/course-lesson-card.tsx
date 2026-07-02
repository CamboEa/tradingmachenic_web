import Image from "next/image";
import Link from "next/link";

import type { Lesson } from "@/lib/course";
import { getLessonThumbnailSrc, lessonVideoCount } from "@/lib/course";
import type { Dictionary, Locale } from "@/lib/i18n";
import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

export function CourseLessonCard({
  lesson,
  locale,
  index,
  dict,
  large = false,
}: {
  lesson: Lesson;
  locale: Locale;
  index: number;
  dict: Dictionary;
  large?: boolean;
}) {
  const href       = `/${locale}/education/${lesson.slug}`;
  const thumbSrc   = getLessonThumbnailSrc(lesson);
  const title      = lesson.titles[locale];
  const summary    = lesson.summaries[locale];
  const videoCount = lessonVideoCount(lesson);
  return (
    <article
      className={cn(
        ui.linkCard,
        "relative cursor-pointer",
        large && "min-h-[22rem] sm:min-h-[24rem]",
      )}
    >
      <Link href={href} className="flex flex-1 flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/40">

        {/* Thumbnail */}
        <div className={`relative overflow-hidden bg-slate-800 ${large ? "aspect-[16/10]" : "aspect-video"}`}>
          {thumbSrc ? (
            <Image src={thumbSrc} alt="" fill sizes="(max-width:768px)100vw,50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" priority={index === 0} />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-surface-soft to-background" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

          {/* Badges */}
          <div className="absolute right-3 top-3 flex gap-1.5">
            {videoCount > 0 && (
              <span className="flex items-center gap-1 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
                <svg width="7" height="8" viewBox="0 0 7 8" fill="currentColor" aria-hidden><polygon points="0,0 7,4 0,8"/></svg>
                {videoCount}
              </span>
            )}
          </div>

          <span className="absolute bottom-3 right-3 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
            {lesson.approximateMinutes} min
          </span>
        </div>

        {/* Body */}
        <div className={`flex flex-1 flex-col ${large ? "p-6" : "p-5"}`}>
          <h3 className={`font-semibold leading-snug text-foreground transition-colors group-hover:text-teal ${large ? "text-lg" : ""}`}>{title}</h3>
          <p className={`mt-2 text-sm leading-relaxed text-ink-soft ${large ? "line-clamp-3" : "line-clamp-2"}`}>{summary}</p>
          <div className={`mt-auto flex items-center justify-end border-t border-bridge/30 ${large ? "pt-5" : "pt-4"}`}>
            <span className={`flex items-center gap-1.5 rounded-full font-semibold text-teal ring-1 ring-teal/30 transition-all group-hover:bg-teal group-hover:text-white group-hover:ring-transparent ${large ? "px-4 py-2 text-sm" : "px-3.5 py-1.5 text-xs"}`}>
              {dict.course.openLesson}
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
