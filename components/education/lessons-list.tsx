"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { useConfirm } from "@/components/shared/confirm-dialog";
import { Badge, ButtonLink, Card, EmptyState } from "@/components/ui";
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
  const { confirm, ConfirmDialogHost } = useConfirm();

  const filteredLessons = lessons.filter((lesson) => {
    if (filter === "all") return true;
    return lesson.type === filter;
  });

  async function handleDeleteClick(lesson: Lesson) {
    await confirm({
      title: "Delete this lesson?",
      description: `"${lesson.titles.en}" and all of its videos will be permanently removed. This cannot be undone.`,
      confirmLabel: "Delete lesson",
      cancelLabel: "Keep lesson",
      variant: "danger",
      onConfirm: async () => {
        setDeleting(lesson.slug);
        const result = await deleteLesson(lesson.slug);
        if (result.error) {
          toast.error(result.error);
          setDeleting(null);
          throw new Error(result.error);
        }
        toast.success("Lesson deleted successfully!");
        window.location.reload();
      },
    });
    setDeleting(null);
  }

  function toggleExpand(slug: string) {
    setExpandedLesson(expandedLesson === slug ? null : slug);
  }

  const emptyLabel =
    filter === "all" ? "lessons" : filter === "free" ? "free lessons" : "paid lessons";

  return (
    <>
      <div className="space-y-5">
        <div className="flex gap-2">
          {(["all", "free", "paid"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                filter === type
                  ? "bg-teal text-white"
                  : "border border-slate-200 text-slate-600 hover:border-teal/30 hover:text-teal"
              }`}
            >
              {type === "all" ? "All Lessons" : type === "free" ? "Free" : "Paid"}
            </button>
          ))}
        </div>

        {filteredLessons.length === 0 ? (
          <EmptyState
            title={`No ${emptyLabel} found`}
            description="Add a lesson or change the filter to see more items."
            action={{ href: "/admin/lessons/add", label: "+ Add Lesson" }}
          />
        ) : (
          <div className="space-y-5">
            {filteredLessons.map((lesson, idx) => (
              <Card key={lesson.slug} padding={false} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleExpand(lesson.slug)}
                  className="w-full text-left transition hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="teal" className="h-7 w-7 justify-center p-0">
                        {idx + 1}
                      </Badge>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-brand">{lesson.titles.en}</p>
                          {lesson.type ? (
                            <Badge variant={lesson.type === "free" ? "published" : "warning"}>
                              {lesson.type}
                            </Badge>
                          ) : null}
                          <Badge variant={lesson.status === "published" ? "published" : "draft"}>
                            {lesson.status === "published" ? "Published" : "Draft"}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400">{lesson.titles.km}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">~{lesson.approximateMinutes} min</span>
                      <Badge variant="neutral">
                        {lesson.videos.length} {lesson.videos.length === 1 ? "video" : "videos"}
                      </Badge>
                      <svg
                        className={`h-5 w-5 text-slate-400 transition-transform ${
                          expandedLesson === lesson.slug ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
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

                {expandedLesson === lesson.slug && (
                  <>
                    <div className="grid grid-cols-3 gap-4 border-b border-slate-100 px-5 py-3 text-xs">
                      <div>
                        <p className="font-medium text-slate-500">Slug</p>
                        <p className="mt-0.5 font-mono text-slate-700">{lesson.slug}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-500">Summary (EN)</p>
                        <p className="mt-0.5 line-clamp-2 text-slate-700">{lesson.summaries.en}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-500">Objectives</p>
                        <p className="mt-0.5 text-slate-700">{lesson.objectives.en.length} items</p>
                      </div>
                    </div>

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
                                <p className="truncate text-[11px] text-slate-400">{v.embedUrl}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-slate-100 px-5 py-3">
                      <ButtonLink
                        href={`/admin/lessons/edit/${lesson.slug}`}
                        variant="secondary"
                        className="flex-1 px-3 py-2 text-xs"
                      >
                        Edit
                      </ButtonLink>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(lesson)}
                        disabled={deleting === lesson.slug}
                        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-red-300 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deleting === lesson.slug ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
      {ConfirmDialogHost}
    </>
  );
}
