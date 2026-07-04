"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import type { Lesson, LessonVideo } from "@/lib/education/course";
import { youtubeThumbnailFromEmbed } from "@/lib/education/course";
import { deleteLesson, deleteLessonVideo } from "@/lib/supabase/actions";
import { ui } from "@/lib/ui/styles";

type VideoRow = {
  key: string;
  lesson: Lesson;
  video: LessonVideo;
  number: number;
};

function flattenLessonVideos(lessons: Lesson[]): VideoRow[] {
  let number = 0;
  const rows: VideoRow[] = [];

  for (const lesson of lessons) {
    for (const video of lesson.videos) {
      number += 1;
      rows.push({
        key: video.id ?? `${lesson.slug}-${number}`,
        lesson,
        video,
        number,
      });
    }
  }

  return rows;
}

export function countVideosInLessons(lessons: Lesson[]): number {
  return lessons.reduce((sum, lesson) => sum + lesson.videos.length, 0);
}

function videoTitle(video: LessonVideo, lesson: Lesson, number: number): string {
  return video.titles?.en?.trim() || lesson.titles.en || `Lesson ${number}`;
}

const filter: Filter<VideoRow> = {
  allLabel: "All lessons",
  groups: [
    {
      label: "Type",
      options: [
        { label: "Free", value: "type:free", predicate: (row) => row.lesson.type === "free" },
        { label: "Paid", value: "type:paid", predicate: (row) => row.lesson.type === "paid" },
      ],
    },
    {
      label: "Status",
      options: [
        {
          label: "Published",
          value: "status:published",
          predicate: (row) => row.lesson.status === "published",
        },
        {
          label: "Draft",
          value: "status:draft",
          predicate: (row) => row.lesson.status === "draft",
        },
      ],
    },
  ],
};

export function TopicLessonVideosTable({ lessons }: { lessons: Lesson[] }) {
  const router = useRouter();
  const { confirm, ConfirmDialogHost } = useConfirm();
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const rows = useMemo(() => flattenLessonVideos(lessons), [lessons]);

  async function handleDelete(row: VideoRow) {
    const title = videoTitle(row.video, row.lesson, row.number);
    const isOnlyVideo = row.lesson.videos.length === 1;

    await confirm({
      title: isOnlyVideo ? "Delete this lesson?" : "Remove this video?",
      description: isOnlyVideo
        ? `"${title}" will be permanently removed.`
        : `"${title}" will be removed from this topic.`,
      confirmLabel: isOnlyVideo ? "Delete lesson" : "Remove video",
      cancelLabel: "Keep",
      variant: "danger",
      onConfirm: async () => {
        setDeletingKey(row.key);
        const result = isOnlyVideo
          ? await deleteLesson(row.lesson.slug)
          : await deleteLessonVideo(row.video.id as string);

        if (result.error) {
          toast.error(result.error);
          setDeletingKey(null);
          throw new Error(result.error);
        }

        toast.success(isOnlyVideo ? "Lesson deleted" : "Video removed");
        router.refresh();
        setDeletingKey(null);
      },
    });
    setDeletingKey(null);
  }

  const columns: Column<VideoRow>[] = [
    {
      header: "#",
      align: "center",
      className: "w-12 tabular-nums",
      cell: (row) => <span className="text-ink-soft">{row.number}</span>,
    },
    {
      header: "Thumbnail",
      className: "w-36",
      cell: (row) => {
        const thumb = youtubeThumbnailFromEmbed(row.video.embedUrl);
        return (
          <div className="relative aspect-video w-28 overflow-hidden rounded-lg bg-slate-900">
            {thumb ? (
              <Image src={thumb} alt="" fill sizes="112px" className="object-cover" />
            ) : null}
          </div>
        );
      },
    },
    {
      header: "Lesson",
      cell: (row) => {
        const title = videoTitle(row.video, row.lesson, row.number);
        const subtitle = row.lesson.titles.km;
        const showSubtitle = Boolean(subtitle && subtitle !== title);

        return (
          <>
            <p className="font-semibold text-foreground">{title}</p>
            {showSubtitle ? <p className="text-xs text-ink-soft">{subtitle}</p> : null}
          </>
        );
      },
    },
    {
      header: "Type",
      cell: (row) =>
        row.lesson.type ? (
          <Badge variant={row.lesson.type === "free" ? "teal" : "gold"}>
            {row.lesson.type === "free" ? "Free" : "Paid"}
          </Badge>
        ) : (
          <span className="text-ink-soft">—</span>
        ),
    },
    {
      header: "Duration",
      className: "whitespace-nowrap",
      cell: (row) => (
        <span className="text-ink-soft">~{row.lesson.approximateMinutes} min</span>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <Badge variant={row.lesson.status === "published" ? "published" : "draft"}>
          {row.lesson.status === "published" ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (row) => (
        <RowActions>
          <EditLink href={`/admin/lessons/edit/${row.lesson.slug}`} />
          <button
            type="button"
            onClick={() => handleDelete(row)}
            disabled={deletingKey === row.key}
            className={ui.iconBtnDanger}
            aria-label={`Delete ${videoTitle(row.video, row.lesson, row.number)}`}
            title="Delete"
          >
            {deletingKey === row.key ? <SpinnerIcon /> : <TrashIcon />}
          </button>
        </RowActions>
      ),
    },
  ];

  return (
    <>
      <AdminTable
        data={rows}
        getKey={(row) => row.key}
        columns={columns}
        filter={filter}
        searchPlaceholder="Search lessons by title…"
        searchText={(row) => {
          const title = videoTitle(row.video, row.lesson, row.number);
          return `${title} ${row.lesson.titles.km ?? ""} ${row.lesson.slug}`;
        }}
      />
      {ConfirmDialogHost}
    </>
  );
}
