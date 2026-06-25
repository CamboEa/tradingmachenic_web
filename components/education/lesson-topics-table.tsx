"use client";

import Link from "next/link";

import { DeleteLessonTopicButton } from "@/components/education/delete-lesson-topic-button";
import {
  AdminTable,
  EditLink,
  RowActions,
  type Column,
} from "@/components/ui";
import { adminLessonsListHref } from "@/lib/admin-lessons-nav";
import type { LessonTopic } from "@/lib/supabase/lesson-topics";

export function LessonTopicsTable({
  topics,
  mentorName,
}: {
  topics: LessonTopic[];
  mentorName?: string;
}) {
  const columns: Column<LessonTopic>[] = [
    {
      header: "Topic",
      cell: (topic) => (
        <>
          <p className="font-semibold text-foreground">{topic.names.en}</p>
          {topic.descriptions.en ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-ink-soft">{topic.descriptions.en}</p>
          ) : null}
        </>
      ),
    },
    {
      header: "Slug",
      cell: (topic) => (
        <span className="font-mono text-xs text-ink-soft">{topic.slug}</span>
      ),
    },
    {
      header: "Order",
      align: "center",
      className: "tabular-nums",
      cell: (topic) => <span className="text-ink-soft">{topic.sortOrder}</span>,
    },
    {
      header: "Actions",
      align: "right",
      cell: (topic) => (
        <RowActions>
          <Link
            href={adminLessonsListHref(topic.mentorSlug, topic.slug)}
            className="rounded-lg border border-bridge/40 px-2.5 py-1.5 text-xs font-semibold text-teal transition hover:bg-surface-soft"
          >
            Lessons
          </Link>
          <EditLink href={`/admin/lessons/topics/edit/${topic.id}`} />
          <DeleteLessonTopicButton id={topic.id} name={topic.names.en} />
        </RowActions>
      ),
    },
  ];

  return (
    <AdminTable
      data={topics}
      getKey={(topic) => topic.id}
      columns={columns}
      searchPlaceholder={
        mentorName
          ? `Search ${mentorName} topics…`
          : "Search lesson topics…"
      }
      searchText={(topic) =>
        `${topic.names.en} ${topic.names.km} ${topic.slug} ${topic.descriptions.en}`
      }
    />
  );
}
