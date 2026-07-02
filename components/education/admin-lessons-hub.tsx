"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { DeleteLessonTopicButton } from "@/components/education/delete-lesson-topic-button";
import { LessonTopicModal } from "@/components/education/lesson-topic-modal";
import { LessonsList } from "@/components/education/lessons-list";
import { TopicVideoList } from "@/components/education/topic-video-list";
import {
  AdminBackLink,
  ButtonLink,
  EmptyState,
  TableThumb,
} from "@/components/ui";
import { ChevronRightIcon, PencilIcon } from "@/components/ui/icons";
import {
  adminLessonTopicsHref,
  adminLessonsListHref,
  lessonCountForMentor,
  UNCATEGORIZED_LESSON_TOPIC,
} from "@/lib/education/admin-lessons-nav";
import type { Lesson } from "@/lib/education/course";
import type { LessonTopic } from "@/lib/supabase/lesson-topics";
import { topicsForMentor } from "@/lib/supabase/lesson-topics";
import type { AdminMentor } from "@/lib/supabase/mentors";
import { cn } from "@/lib/ui/cn";
import { ui } from "@/lib/ui/styles";

const UNASSIGNED_MENTOR = "__unassigned__";

/** Two-letter monogram tile used when a mentor/topic has no image. */
function InitialsBadge({ label }: { label: string }) {
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-bridge/30 bg-surface-soft text-sm font-bold uppercase tracking-wide text-teal">
      {label.slice(0, 2)}
    </div>
  );
}

function PickerCard({
  name,
  subtitle,
  imageUrl,
  countLabel,
  onClick,
}: {
  name: string;
  subtitle?: string;
  imageUrl?: string | null;
  countLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        ui.card,
        "flex w-full items-center gap-4 p-4 text-left transition hover:border-teal/30 hover:shadow-md",
      )}
    >
      {imageUrl !== undefined ? (
        imageUrl ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-bridge/30">
            <Image src={imageUrl} alt="" fill className="object-cover" sizes="56px" />
          </div>
        ) : (
          <TableThumb src={null} alt={name} className="h-14 w-14 rounded-full" />
        )
      ) : (
        <InitialsBadge label={name} />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{name}</p>
        {subtitle ? <p className="mt-0.5 truncate text-xs text-ink-soft">{subtitle}</p> : null}
        <p className="mt-1.5 text-xs font-medium text-teal">{countLabel}</p>
      </div>
      <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft" />
    </button>
  );
}

function TopicPickerCard({
  topic,
  videoCount,
  href,
  onEdit,
}: {
  topic: LessonTopic;
  videoCount: number;
  href: string;
  onEdit: () => void;
}) {
  return (
    <article
      className={cn(
        ui.card,
        "group flex min-w-0 items-stretch overflow-hidden transition hover:border-teal/30 hover:shadow-md",
      )}
    >
      <Link
        href={href}
        className="flex min-w-0 flex-1 items-center gap-4 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal/40"
      >
        <InitialsBadge label={topic.names.en} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-foreground">{topic.names.en}</h3>
          <p className="mt-0.5 truncate text-xs text-ink-soft">
            {topic.descriptions.en || topic.slug}
          </p>
          <p className="mt-1.5 text-xs font-medium text-teal">{videoCountLabel(videoCount)}</p>
        </div>
        <ChevronRightIcon className="h-5 w-5 shrink-0 text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-teal" />
      </Link>

      <div className="flex shrink-0 flex-col items-center justify-center gap-1.5 border-l border-bridge/30 bg-surface-soft/40 px-2">
        <button
          type="button"
          onClick={onEdit}
          className={ui.iconBtn}
          aria-label={`Edit ${topic.names.en}`}
          title="Edit"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <DeleteLessonTopicButton id={topic.id} name={topic.names.en} />
      </div>
    </article>
  );
}

function countLabel(count: number): string {
  return count === 1 ? "1 lesson" : `${count} lessons`;
}

function videoCountLabel(count: number): string {
  return count === 1 ? "1 video" : `${count} videos`;
}

function mentorLessons(lessons: Lesson[], mentorSlug: string): Lesson[] {
  return lessons.filter((lesson) => lesson.mentorSlug === mentorSlug);
}

export function AdminLessonsHub({
  mentors,
  lessons,
  topics,
}: {
  mentors: AdminMentor[];
  lessons: Lesson[];
  topics: LessonTopic[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topicModal, setTopicModal] = useState<LessonTopic | "new" | null>(null);
  const mentorParam = searchParams.get("mentor")?.trim() ?? "";
  const topicParam = searchParams.get("topic")?.trim() ?? "";

  const selectedMentor = useMemo(
    () => mentors.find((mentor) => mentor.slug === mentorParam) ?? null,
    [mentors, mentorParam],
  );

  const isUnassigned = mentorParam === UNASSIGNED_MENTOR;
  const isUncategorized = topicParam === UNCATEGORIZED_LESSON_TOPIC;

  const mentorTopicList = useMemo(
    () => (selectedMentor ? topicsForMentor(topics, selectedMentor.slug) : []),
    [selectedMentor, topics],
  );

  const selectedTopic = useMemo(
    () =>
      isUncategorized
        ? null
        : mentorTopicList.find((topic) => topic.slug === topicParam) ?? null,
    [isUncategorized, mentorTopicList, topicParam],
  );

  const unassignedCount = useMemo(
    () => lessons.filter((lesson) => !lesson.mentorSlug).length,
    [lessons],
  );

  const uncategorizedCount = useMemo(() => {
    if (!selectedMentor) return 0;
    return mentorLessons(lessons, selectedMentor.slug).filter(
      (lesson) => !lesson.lessonTopicSlug,
    ).length;
  }, [lessons, selectedMentor]);

  const filteredLessons = useMemo(() => {
    if (isUnassigned) {
      return lessons.filter((lesson) => !lesson.mentorSlug);
    }
    if (!selectedMentor || !topicParam) return [];
    if (isUncategorized) {
      return mentorLessons(lessons, selectedMentor.slug).filter(
        (lesson) => !lesson.lessonTopicSlug,
      );
    }
    return mentorLessons(lessons, selectedMentor.slug).filter(
      (lesson) => lesson.lessonTopicSlug === topicParam,
    );
  }, [isUncategorized, isUnassigned, lessons, selectedMentor, topicParam]);

  const showMentorPicker = !mentorParam || (!isUnassigned && !selectedMentor);

  const topicInvalid =
    Boolean(topicParam) &&
    !isUncategorized &&
    !isUnassigned &&
    !selectedTopic &&
    topicParam !== UNCATEGORIZED_LESSON_TOPIC;

  const hasTopicChoices =
    mentorTopicList.length > 0 || uncategorizedCount > 0 || isUnassigned;

  const showTopicPicker =
    !showMentorPicker && !isUnassigned && (!topicParam || topicInvalid) && hasTopicChoices;

  const showLessons =
    !showMentorPicker &&
    !showTopicPicker &&
    Boolean(topicParam) &&
    (isUnassigned || selectedMentor);

  function pushParams(next: { mentor?: string; topic?: string }) {
    const params = new URLSearchParams();
    if (next.mentor) params.set("mentor", next.mentor);
    if (next.topic) params.set("topic", next.topic);
    const query = params.toString();
    router.push(query ? `/admin/lessons?${query}` : "/admin/lessons");
  }

  function selectMentor(slug: string) {
    if (slug === UNASSIGNED_MENTOR) {
      pushParams({ mentor: slug, topic: UNCATEGORIZED_LESSON_TOPIC });
      return;
    }

    const mentorTopics = topicsForMentor(topics, slug);
    const mentorLessonRows = mentorLessons(lessons, slug);
    const uncategorized = mentorLessonRows.filter((lesson) => !lesson.lessonTopicSlug).length;

    if (mentorTopics.length === 1 && uncategorized === 0) {
      pushParams({ mentor: slug, topic: mentorTopics[0].slug });
      return;
    }
    if (mentorTopics.length === 0 && uncategorized > 0) {
      pushParams({ mentor: slug, topic: UNCATEGORIZED_LESSON_TOPIC });
      return;
    }
    pushParams({ mentor: slug });
  }

  function selectTopic(topicSlug: string) {
    pushParams({ mentor: mentorParam, topic: topicSlug });
  }

  const closeTopicModal = useCallback(() => setTopicModal(null), []);

  const handleTopicSaved = useCallback(() => {
    setTopicModal(null);
    router.refresh();
  }, [router]);

  if (showMentorPicker) {
    return (
      <div>
        <p className="mb-6 text-sm text-ink-soft">
          Choose a mentor, then pick a lesson topic like ICT or CSNR.
        </p>

        {mentors.length === 0 && unassignedCount === 0 ? (
          <EmptyState
            title="No mentors yet"
            description="Create a mentor profile first, then add lesson topics and lessons."
            action={{ href: "/admin/mentors/add", label: "+ Add Mentor" }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mentors.map((mentor) => (
              <PickerCard
                key={mentor.id}
                name={mentor.names.en}
                subtitle={mentor.titles.en || mentor.slug}
                imageUrl={mentor.imageUrl}
                countLabel={countLabel(lessonCountForMentor(lessons, mentor.slug))}
                onClick={() => selectMentor(mentor.slug)}
              />
            ))}

            {unassignedCount > 0 ? (
              <PickerCard
                name="Unassigned"
                subtitle="Lessons without a mentor"
                imageUrl={null}
                countLabel={countLabel(unassignedCount)}
                onClick={() => selectMentor(UNASSIGNED_MENTOR)}
              />
            ) : null}
          </div>
        )}
      </div>
    );
  }

  if (showTopicPicker && selectedMentor) {
    return (
      <div>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <AdminBackLink href="/admin/lessons" label="All mentors" />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">
                {selectedMentor.names.en}
              </h2>
              <p className="mt-0.5 text-sm text-ink-soft">
                {selectedMentor.titles.en || selectedMentor.slug}
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                Select a lesson topic, or create a new one.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTopicModal("new")}
            className={cn(ui.btnPrimary, "shrink-0")}
          >
            + Add topic
          </button>
        </div>

        {mentorTopicList.length === 0 && uncategorizedCount === 0 ? (
          <EmptyState
            title="No lesson topics yet"
            description="Use the Add topic button above to create ICT, CSNR, CRT, or another topic."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mentorTopicList.map((topic) => {
              const videoCount = mentorLessons(lessons, selectedMentor.slug)
                .filter((lesson) => lesson.lessonTopicSlug === topic.slug)
                .reduce((sum, lesson) => sum + lesson.videos.length, 0);

              return (
                <TopicPickerCard
                  key={topic.id}
                  topic={topic}
                  videoCount={videoCount}
                  href={adminLessonsListHref(selectedMentor.slug, topic.slug)}
                  onEdit={() => setTopicModal(topic)}
                />
              );
            })}

            {uncategorizedCount > 0 ? (
              <PickerCard
                name="Uncategorized"
                subtitle="Lessons without a topic"
                countLabel={countLabel(uncategorizedCount)}
                onClick={() => selectTopic(UNCATEGORIZED_LESSON_TOPIC)}
              />
            ) : null}
          </div>
        )}

        {topicModal ? (
          <LessonTopicModal
            key={topicModal === "new" ? "new" : topicModal.id}
            mentorSlug={selectedMentor.slug}
            mentorName={selectedMentor.names.en}
            topic={topicModal === "new" ? undefined : topicModal}
            onClose={closeTopicModal}
            onSaved={handleTopicSaved}
          />
        ) : null}
      </div>
    );
  }

  if (!showLessons || !topicParam) {
    return (
      <EmptyState
        title="Topic not found"
        description="Go back and choose a valid mentor and lesson topic."
        action={{ href: "/admin/lessons", label: "Back to lessons" }}
      />
    );
  }

  const topicLabel = isUncategorized
    ? "Uncategorized"
    : isUnassigned
      ? "Unassigned"
      : selectedTopic?.names.en ?? topicParam;

  const heading = isUnassigned
    ? "Unassigned lessons"
    : `${selectedMentor!.names.en} · ${topicLabel}`;

  const subheading = isUnassigned
    ? "Lessons without a mentor assigned."
    : isUncategorized
      ? "Assign these lessons to a topic when editing them."
      : selectedTopic?.descriptions.en || selectedMentor!.titles.en;

  // A real topic maps to a single lesson; open it straight onto its video list
  // instead of a one-row lessons table.
  const topicLesson =
    !isUnassigned && !isUncategorized && filteredLessons.length === 1
      ? filteredLessons[0]
      : null;

  const topicChoices = mentorTopicList.length + (uncategorizedCount > 0 ? 1 : 0);
  const backHref =
    isUnassigned || topicChoices <= 1
      ? "/admin/lessons"
      : adminLessonsListHref(mentorParam);
  const backLabel = isUnassigned || topicChoices <= 1 ? "All mentors" : "Topics";

  const addLessonHref = (() => {
    const params = new URLSearchParams();
    if (!isUnassigned && selectedMentor) {
      params.set("mentor", selectedMentor.slug);
    }
    if (!isUncategorized && !isUnassigned && selectedTopic) {
      params.set("topic", selectedTopic.slug);
    }
    return `/admin/lessons/add?${params.toString()}`;
  })();

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <AdminBackLink href={backHref} label={backLabel} />
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">{heading}</h2>
            <p className="mt-0.5 text-sm text-ink-soft">{subheading}</p>
            <p className="mt-1 text-xs font-medium text-teal">
              {topicLesson
                ? `${topicLesson.videos.length} ${topicLesson.videos.length === 1 ? "video" : "videos"}`
                : countLabel(filteredLessons.length)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {topicLesson ? (
            <ButtonLink href={`/admin/lessons/edit/${topicLesson.slug}`}>
              Manage videos
            </ButtonLink>
          ) : (
            <>
              {selectedMentor ? (
                <ButtonLink href={adminLessonTopicsHref(selectedMentor.slug)} variant="secondary">
                  Manage topics
                </ButtonLink>
              ) : null}
              <ButtonLink href={addLessonHref}>+ Add Lesson</ButtonLink>
            </>
          )}
        </div>
      </div>

      {filteredLessons.length === 0 ? (
        <EmptyState
          title={`No lessons in ${topicLabel} yet`}
          description="Add the first lesson for this topic."
          action={{ href: addLessonHref, label: "+ Add Lesson" }}
        />
      ) : topicLesson ? (
        <TopicVideoList lesson={topicLesson} />
      ) : (
        <LessonsList lessons={filteredLessons} />
      )}
    </div>
  );
}
