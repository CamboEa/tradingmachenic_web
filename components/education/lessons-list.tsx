"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { useConfirm } from "@/components/shared/confirm-dialog";
import {
  AdminTable,
  Badge,
  EditLink,
  RowActions,
  type Column,
  type Filter,
} from "@/components/ui";
import { SpinnerIcon, TrashIcon } from "@/components/ui/icons";
import type { Lesson } from "@/lib/education/course";
import { deleteLesson } from "@/lib/supabase/actions";
import { ui } from "@/lib/ui/styles";

interface LessonsListProps {
  lessons: Lesson[];
}

const filter: Filter<Lesson> = {
  allLabel: "All lessons",
  groups: [
    {
      label: "Type",
      options: [
        { label: "Free", value: "type:free", predicate: (l) => l.type === "free" },
      ],
    },
    {
      label: "Status",
      options: [
        { label: "Published", value: "status:published", predicate: (l) => l.status === "published" },
        { label: "Draft", value: "status:draft", predicate: (l) => l.status === "draft" },
      ],
    },
  ],
};

export function LessonsList({ lessons }: LessonsListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const { confirm, ConfirmDialogHost } = useConfirm();

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

  const columns: Column<Lesson>[] = [
    {
      header: "Lesson",
      cell: (lesson) => (
        <>
          <p className="font-semibold text-foreground">{lesson.titles.en}</p>
          {lesson.titles.km ? <p className="text-xs text-ink-soft">{lesson.titles.km}</p> : null}
        </>
      ),
    },
    {
      header: "Type",
      cell: (lesson) =>
        lesson.type ? (
          <Badge variant={lesson.type === "free" ? "teal" : "gold"}>
            {lesson.type === "free" ? "Free" : "Paid"}
          </Badge>
        ) : (
          <span className="text-ink-soft">—</span>
        ),
    },
    {
      header: "Videos",
      align: "center",
      className: "tabular-nums",
      cell: (lesson) => <span className="text-ink-soft">{lesson.videos.length}</span>,
    },
    {
      header: "Duration",
      className: "whitespace-nowrap",
      cell: (lesson) => <span className="text-ink-soft">~{lesson.approximateMinutes} min</span>,
    },
    {
      header: "Status",
      cell: (lesson) => (
        <Badge variant={lesson.status === "published" ? "published" : "draft"}>
          {lesson.status === "published" ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (lesson) => (
        <RowActions>
          <EditLink href={`/admin/lessons/edit/${lesson.slug}`} />
          <button
            type="button"
            onClick={() => handleDeleteClick(lesson)}
            disabled={deleting === lesson.slug}
            className={ui.iconBtnDanger}
            aria-label={`Delete ${lesson.titles.en}`}
            title="Delete"
          >
            {deleting === lesson.slug ? <SpinnerIcon /> : <TrashIcon />}
          </button>
        </RowActions>
      ),
    },
  ];

  return (
    <>
      <AdminTable
        data={lessons}
        getKey={(lesson) => lesson.slug}
        columns={columns}
        filter={filter}
        searchPlaceholder="Search lessons by title…"
        searchText={(lesson) => `${lesson.titles.en} ${lesson.titles.km ?? ""} ${lesson.slug}`}
      />
      {ConfirmDialogHost}
    </>
  );
}
