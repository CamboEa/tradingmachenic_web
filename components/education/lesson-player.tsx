"use client";

import { useState } from "react";

import type { Lesson, LessonVideo } from "@/lib/course";
import { youtubeThumbnailFromEmbed } from "@/lib/course";
import type { Locale } from "@/lib/i18n";
import {
 isDirectVideoFileUrl,
 isYouTubeVideoUrl,
 resolveLessonVideoEmbedUrl,
} from "@/lib/video";

interface LessonStrings {
 videoInLessonHeading: string;
 objectives: string;
 /** "{count} videos" */
 videosInLesson: string;
 paidVideoHint?: string;
 videoFallback?: string;
}

interface LessonPlayerProps {
 lesson: Lesson;
 locale: Locale;
 t: LessonStrings;
}

function formatHeading(template: string, current: number, total: number) {
 return template.replace("{current}", String(current)).replace("{total}", String(total));
}

function formatCount(template: string, count: number) {
 return template.replace("{count}", String(count));
}

function videoThumb(lesson: Lesson, video: LessonVideo): string {
 return youtubeThumbnailFromEmbed(video.embedUrl) || lesson.thumbnailUrl || "";
}

function PlayIcon({ className }: { className?: string }) {
 return (
 <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
 <path d="M3 3.732a1.5 1.5 0 0 1 2.305-1.265l6.706 4.268a1.5 1.5 0 0 1 0 2.53L5.305 13.533A1.5 1.5 0 0 1 3 12.268V3.732Z" />
 </svg>
 );
}

function ThumbBox({
 src,
 alt,
 className = "",
}: {
 src: string;
 alt: string;
 className?: string;
}) {
 return (
 <div className={`relative aspect-video shrink-0 overflow-hidden rounded-lg bg-slate-900 ${className}`}>
 {src ? (
 // eslint-disable-next-line @next/next/no-img-element
 <img src={src} alt={alt} className="h-full w-full object-cover" />
 ) : (
 <div className="flex h-full w-full items-center justify-center text-white/40">
 <PlayIcon className="h-5 w-5" />
 </div>
 )}
 </div>
 );
}

function VideoSurface({
 src,
 title,
 isDirectFile,
}: {
 src: string;
 title: string;
 isDirectFile: boolean;
}) {
 if (isDirectFile) {
 return (
 <video
 key={src}
 src={src}
 controls
 playsInline
 preload="metadata"
 className="h-full w-full bg-black object-contain"
 title={title}
 >
 <track kind="captions" />
 </video>
 );
 }

 return (
 <iframe
 key={src}
 title={title}
 src={src}
 className="h-full w-full"
 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
 allowFullScreen
 />
 );
}

export function LessonPlayer({ lesson, locale, t }: LessonPlayerProps) {
 const videos = lesson.videos;
 const total = videos.length;
 const [activeIndex, setActiveIndex] = useState(0);
 const [descOpen, setDescOpen] = useState(false);

 const activeVideo = videos[activeIndex];
 const activeTitle =
 activeVideo.titles?.[locale] ?? formatHeading(t.videoInLessonHeading, activeIndex + 1, total);

 const rawUrl = activeVideo.embedUrl;
 const isDirect = isDirectVideoFileUrl(rawUrl);
 const playbackSrc = isDirect ? rawUrl.trim() : resolveLessonVideoEmbedUrl(rawUrl);
 const showPaidHint = t.paidVideoHint && isDirect && !isYouTubeVideoUrl(rawUrl);

 const objectives = lesson.objectives[locale];
 const summary = lesson.summaries[locale];
 const isPaid = lesson.type === "paid";

 const metaLine = `${formatCount(t.videosInLesson, total)} · ~${lesson.approximateMinutes} min`;

 return (
 <div className="grid gap-x-6 gap-y-8 lg:grid-cols-[minmax(0,1fr)_388px]">
 {/* ── Left: player + info ── */}
 <div className="min-w-0">
 <div className="overflow-hidden rounded-2xl border border-slate-900/10 bg-black">
 <div className="aspect-video w-full">
 <VideoSurface
 src={playbackSrc}
 title={`${lesson.titles[locale]} — ${activeTitle}`}
 isDirectFile={isDirect}
 />
 </div>
 </div>

 {/* Title */}
 <h1 className="mt-4 text-xl font-bold tracking-tight text-[var(--color-ink)] sm:text-2xl">
 {total > 1 ? activeTitle : lesson.titles[locale]}
 </h1>

 {/* Meta row */}
 <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--color-ink-muted)]">
 <span
 className={[
 "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
 isPaid
 ? "bg-[color-mix(in_oklab,var(--color-gold)_18%,transparent)] text-[var(--color-gold)]"
 : "bg-[color-mix(in_oklab,var(--color-teal)_14%,transparent)] text-[var(--color-teal)]",
 ].join(" ")}
 >
 {isPaid ? "Paid" : "Free"}
 </span>
 <span className="font-medium">{metaLine}</span>
 </div>

 {/* Description box (YouTube-style) */}
 <div className="mt-4 rounded-xl bg-[color-mix(in_oklab,var(--color-bridge)_28%,transparent)] p-4">
 <p className="text-sm font-semibold text-[var(--color-ink)]">{lesson.titles[locale]}</p>
 <p
 className={[
 "mt-1.5 whitespace-pre-line text-sm leading-relaxed text-[var(--color-ink-muted)]",
 descOpen ? "" : "line-clamp-2",
 ].join(" ")}
 >
 {summary}
 </p>

 {descOpen && objectives.length > 0 ? (
 <div className="mt-4 border-t border-black/5 pt-4">
 <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
 {t.objectives}
 </p>
 <ul className="mt-3 space-y-2">
 {objectives.map((item) => (
 <li
 key={item}
 className="flex gap-2.5 text-sm leading-snug text-[var(--color-ink-muted)]"
 >
 <span
 className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-teal)]"
 aria-hidden
 />
 <span>{item}</span>
 </li>
 ))}
 </ul>
 </div>
 ) : null}

 {objectives.length > 0 || (summary?.length ?? 0) > 120 ? (
 <button
 type="button"
 onClick={() => setDescOpen((v) => !v)}
 className="mt-3 text-sm font-semibold text-[var(--color-ink)] transition hover:text-[var(--color-teal)]"
 >
 {descOpen ? "Show less" : "…more"}
 </button>
 ) : null}
 </div>

 {showPaidHint ? (
 <p className="mt-3 text-xs leading-relaxed text-[var(--color-ink-soft)]">
 {t.paidVideoHint}
 </p>
 ) : t.videoFallback ? (
 <p className="mt-3 text-xs leading-relaxed text-[var(--color-ink-soft)]">
 {t.videoFallback}
 </p>
 ) : null}
 </div>

 {/* ── Right rail: playlist + up next ── */}
 <aside className="min-w-0 space-y-6">
 {total > 1 ? (
 <div className="rounded-2xl border border-[color-mix(in_oklab,var(--color-bridge)_60%,transparent)] bg-[var(--color-surface)]">
 <p className="border-b border-[color-mix(in_oklab,var(--color-bridge)_55%,transparent)] px-4 py-3 text-sm font-bold text-[var(--color-ink)]">
 {formatCount(t.videosInLesson, total)}
 </p>
 <ul className="max-h-[28rem] overflow-y-auto p-2">
 {videos.map((video, index) => {
 const title =
 video.titles?.[locale] ??
 formatHeading(t.videoInLessonHeading, index + 1, total);
 const isActive = index === activeIndex;
 return (
 <li key={index}>
 <button
 type="button"
 onClick={() => setActiveIndex(index)}
 aria-current={isActive ? "true" : undefined}
 className={[
 "flex w-full cursor-pointer items-start gap-3 rounded-xl p-2 text-left transition",
 isActive
 ? "bg-[color-mix(in_oklab,var(--color-teal)_10%,transparent)]"
 : "hover:bg-[color-mix(in_oklab,var(--color-bridge)_35%,transparent)]",
 ].join(" ")}
 >
 <div className="relative">
 <ThumbBox src={videoThumb(lesson, video)} alt={title} className="w-36" />
 {isActive ? (
 <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/45 text-white">
 <PlayIcon className="h-5 w-5" />
 </span>
 ) : null}
 </div>
 <div className="min-w-0 flex-1 pt-0.5">
 <span
 className={[
 "block text-sm font-semibold leading-snug line-clamp-2",
 isActive ? "text-[var(--color-teal)]" : "text-[var(--color-ink)]",
 ].join(" ")}
 >
 {title}
 </span>
 <span className="mt-1 block text-xs text-[var(--color-ink-soft)]">
 {formatHeading(t.videoInLessonHeading, index + 1, total)}
 </span>
 </div>
 </button>
 </li>
 );
 })}
 </ul>
 </div>
 ) : null}
 </aside>
 </div>
 );
}
