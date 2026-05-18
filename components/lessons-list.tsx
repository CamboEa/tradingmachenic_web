"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import type { Lesson } from "@/lib/course";
import { deleteLesson } from "@/lib/supabase/actions";

type FilterType = "all" | "free" | "paid";

interface LessonsListProps {
  lessons: Lesson[];
}

export function LessonsList({ lessons }: LessonsListProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);

  const filteredLessons = lessons.filter((lesson) => {
    if (filter === "all") return true;
    return lesson.type === filter;
  });

  async function handleDelete(slug: string) {
    const toastId = toast.loading("Deleting lesson...");
    setDeleting(slug);
    
    const result = await deleteLesson(slug);
    
    if (result.error) {
      toast.update(toastId, {
        render: `Error: ${result.error}`,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    } else {
      toast.update(toastId, {
        render: "Lesson deleted successfully!",
        type: "success",
        isLoading: false,
        autoClose: 4000,
      });
    }
    
    setDeleting(null);
  }

  function toggleExpand(slug: string) {
    setExpandedLesson(expandedLesson === slug ? null : slug);
  }

  return (
    <div className="space-y-5">
      {/* Filter buttons */}
      <div className="flex gap-2">
        {(["all", "free", "paid"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
              filter === type
                ? "bg-[#0ea5e9] text-white shadow-sm"
                : "border border-slate-200 text-slate-600 hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
            }`}
          >
            {type === "all" ? "All Lessons" : type === "free" ? "Free" : "Paid"}
          </button>
        ))}
      </div>

      {/* Lessons list */}
      {filteredLessons.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-400">
            No {filter === "all" ? "lessons" : `${filter} lessons`} found.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredLessons.map((lesson, idx) => (
            <div
              key={lesson.slug}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Lesson header - clickable */}
              <button
                type="button"
                onClick={() => toggleExpand(lesson.slug)}
                className="w-full text-left transition hover:bg-slate-50"
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#1e293b]">
                          {lesson.titles.en}
                        </p>
                        {lesson.type && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              lesson.type === "free"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {lesson.type}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            lesson.status === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {lesson.status === "published" ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{lesson.titles.km}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      ~{lesson.approximateMinutes} min
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {lesson.videos.length}{" "}
                      {lesson.videos.length === 1 ? "video" : "videos"}
                    </span>
                    <svg
                      className={`h-5 w-5 text-slate-400 transition-transform ${
                        expandedLesson === lesson.slug ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </div>
              </button>

              {/* Expanded details */}
              {expandedLesson === lesson.slug && (
                <>
                  {/* Lesson meta */}
                  <div className="grid grid-cols-3 gap-4 border-b border-slate-100 px-5 py-3 text-xs">
                    <div>
                      <p className="font-medium text-slate-500">Slug</p>
                      <p className="mt-0.5 font-mono text-slate-700">
                        {lesson.slug}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-500">Summary (EN)</p>
                      <p className="mt-0.5 line-clamp-2 text-slate-700">
                        {lesson.summaries.en}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-500">Objectives</p>
                      <p className="mt-0.5 text-slate-700">
                        {lesson.objectives.en.length} items
                      </p>
                    </div>
                  </div>

                  {/* Videos */}
                  <div className="border-b border-slate-100 px-5 py-3">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Videos
                    </p>
                    <div className="space-y-1.5">
                      {lesson.videos.map((v, vi) => (
                        <div
                          key={vi}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                              {vi + 1}
                            </span>
                            <div className="min-w-0">
                              {v.titles?.en && (
                                <p className="truncate text-xs font-medium text-slate-700">
                                  {v.titles.en}
                                </p>
                              )}
                              <p className="truncate text-[11px] text-slate-400">
                                {v.embedUrl}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 border-t border-slate-100 px-5 py-3">
                    <Link
                      href={`/admin/lessons/edit/${lesson.slug}`}
                      className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:border-[#0ea5e9] hover:text-[#0ea5e9]"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(lesson.slug)}
                      disabled={deleting === lesson.slug}
                      className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deleting === lesson.slug ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
