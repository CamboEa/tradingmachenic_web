"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { LessonAddModal } from "@/components/education/lesson-add-modal";
import { LessonTopicModal } from "@/components/education/lesson-topic-modal";
import {
  LessonsBackButton,
  LessonsEmptyPanel,
  LessonsPanelHeader,
  TopicPickerCard,
  videoCountLabel,
} from "@/components/education/mentor-detail/mentor-lessons-ui";
import {
  countVideosInLessons,
  TopicLessonVideosTable,
} from "@/components/education/topic-lesson-videos-table";
import { UNCATEGORIZED_LESSON_TOPIC } from "@/lib/education/admin-lessons-nav";
import { Badge, Button, Card } from "@/components/ui";
import type { Lesson } from "@/lib/education/course";
import type { EducationCategory } from "@/lib/education/categories";
import type { LessonTopic } from "@/lib/supabase/lesson-topics";

type MentorLessonsSectionProps = {
  mentorSlug: string;
  mentorName: string;
  categories: EducationCategory[];
  topics: LessonTopic[];
  lessons: Lesson[];
  initialTopicSlug?: string;
  onTopicChange: (topicSlug: string | null) => void;
};

export function MentorLessonsSection({
  mentorSlug,
  mentorName,
  categories,
  topics,
  lessons,
  initialTopicSlug,
  onTopicChange,
}: MentorLessonsSectionProps) {
  const router = useRouter();
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(
    initialTopicSlug ?? null,
  );
  const [topicModal, setTopicModal] = useState<LessonTopic | "new" | null>(null);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);

  const uncategorizedLessons = useMemo(
    () => lessons.filter((lesson) => !lesson.lessonTopicSlug),
    [lessons],
  );

  const lessonsByTopic = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    for (const lesson of lessons) {
      if (!lesson.lessonTopicSlug) continue;
      const list = map.get(lesson.lessonTopicSlug) ?? [];
      list.push(lesson);
      map.set(lesson.lessonTopicSlug, list);
    }
    return map;
  }, [lessons]);

  const selectedTopic = useMemo(
    () =>
      selectedTopicSlug && selectedTopicSlug !== UNCATEGORIZED_LESSON_TOPIC
        ? topics.find((topic) => topic.slug === selectedTopicSlug) ?? null
        : null,
    [selectedTopicSlug, topics],
  );

  const selectedLessons = useMemo(() => {
    if (!selectedTopicSlug) return [];
    if (selectedTopicSlug === UNCATEGORIZED_LESSON_TOPIC) return uncategorizedLessons;
    return lessonsByTopic.get(selectedTopicSlug) ?? [];
  }, [lessonsByTopic, selectedTopicSlug, uncategorizedLessons]);

  const selectedVideoCount = useMemo(
    () => countVideosInLessons(selectedLessons),
    [selectedLessons],
  );

  const selectTopic = useCallback(
    (topicSlug: string) => {
      setSelectedTopicSlug(topicSlug);
      onTopicChange(topicSlug);
    },
    [onTopicChange],
  );

  const backToTopics = useCallback(() => {
    setSelectedTopicSlug(null);
    onTopicChange(null);
  }, [onTopicChange]);

  const closeTopicModal = useCallback(() => setTopicModal(null), []);
  const handleTopicSaved = useCallback(() => {
    setTopicModal(null);
    router.refresh();
  }, [router]);

  const closeLessonModal = useCallback(() => setLessonModalOpen(false), []);
  const handleLessonSaved = useCallback(() => {
    setLessonModalOpen(false);
    router.refresh();
  }, [router]);

  const topicTitle =
    selectedTopicSlug === UNCATEGORIZED_LESSON_TOPIC
      ? "Uncategorized"
      : selectedTopic?.names.en ?? selectedTopicSlug;

  const addLessonTopicSlug =
    selectedTopicSlug && selectedTopicSlug !== UNCATEGORIZED_LESSON_TOPIC
      ? selectedTopicSlug
      : undefined;

  const modals = (
    <>
      {topicModal ? (
        <LessonTopicModal
          key={topicModal === "new" ? "new" : topicModal.id}
          mentorSlug={mentorSlug}
          mentorName={mentorName}
          topic={topicModal === "new" ? undefined : topicModal}
          onClose={closeTopicModal}
          onSaved={handleTopicSaved}
        />
      ) : null}

      {lessonModalOpen ? (
        <LessonAddModal
          mentorSlug={mentorSlug}
          mentorName={mentorName}
          categories={categories}
          topics={topics}
          defaultTopicSlug={addLessonTopicSlug}
          onClose={closeLessonModal}
          onSaved={handleLessonSaved}
        />
      ) : null}
    </>
  );

  if (selectedTopicSlug) {
    return (
      <section className="space-y-6">
        <Card>
          <LessonsBackButton onClick={backToTopics} />

          <LessonsPanelHeader
            className="mt-4"
            eyebrow="Topic"
            title={topicTitle ?? "Topic"}
            description={
              selectedTopic?.descriptions.en ||
              "Manage video lessons published under this topic."
            }
            meta={<Badge variant="teal">{videoCountLabel(selectedVideoCount)}</Badge>}
            action={
              <Button onClick={() => setLessonModalOpen(true)}>+ Add lesson</Button>
            }
          />

          <div className="mt-6">
            {selectedVideoCount === 0 ? (
              <LessonsEmptyPanel
                title="No lessons in this topic yet"
                description="Add the first video lesson for this topic."
                actionLabel="+ Add lesson"
                onAction={() => setLessonModalOpen(true)}
              />
            ) : (
              <TopicLessonVideosTable lessons={selectedLessons} />
            )}
          </div>
        </Card>

        {modals}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Card>
        <LessonsPanelHeader
          eyebrow="Topics"
          title="Lessons"
          description="Pick a topic first, then add or edit video lessons inside it."
          action={<Button onClick={() => setTopicModal("new")}>+ Add topic</Button>}
        />

        <div className="mt-6">
          {topics.length === 0 && uncategorizedLessons.length === 0 ? (
            <LessonsEmptyPanel
              title="No topics yet"
              description="Create a topic such as ICT or CSNR, then add lessons inside it."
              actionLabel="+ Add topic"
              onAction={() => setTopicModal("new")}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {topics.map((topic) => {
                const topicLessons = lessonsByTopic.get(topic.slug) ?? [];
                const count = countVideosInLessons(topicLessons);

                return (
                  <TopicPickerCard
                    key={topic.id}
                    title={topic.names.en}
                    subtitle={topic.slug}
                    countLabel={videoCountLabel(count)}
                    onOpen={() => selectTopic(topic.slug)}
                    onEdit={() => setTopicModal(topic)}
                  />
                );
              })}

              {uncategorizedLessons.length > 0 ? (
                <TopicPickerCard
                  title="Uncategorized"
                  subtitle="Lessons without a topic"
                  countLabel={videoCountLabel(countVideosInLessons(uncategorizedLessons))}
                  onOpen={() => selectTopic(UNCATEGORIZED_LESSON_TOPIC)}
                />
              ) : null}
            </div>
          )}
        </div>
      </Card>

      {modals}
    </section>
  );
}
