"use client";

import { useMemo, useState } from "react";

import { MentorForm } from "@/components/education/mentor-form";
import { MentorCategoriesSection } from "@/components/education/mentor-detail/mentor-categories-section";
import type { MentorDetailSectionId } from "@/components/education/mentor-detail/mentor-detail-config";
import { MentorDetailTabs } from "@/components/education/mentor-detail/mentor-detail-tabs";
import { MentorLessonsSection } from "@/components/education/mentor-detail/mentor-lessons-section";
import { MentorTopicsSection } from "@/components/education/mentor-detail/mentor-topics-section";
import type { EducationCategory } from "@/lib/education/categories";
import type { Lesson } from "@/lib/education/course";
import { sortLessonsByDisplayOrder } from "@/lib/education/lessons-sort";
import type { LessonTopic } from "@/lib/supabase/lesson-topics";
import type { AdminMentor } from "@/lib/supabase/mentors";

type MentorDetailSectionsProps = {
  mentor: AdminMentor;
  lessons: Lesson[];
  topics: LessonTopic[];
};

export function MentorDetailSections({ mentor, lessons, topics }: MentorDetailSectionsProps) {
  const [activeSection, setActiveSection] =
    useState<MentorDetailSectionId>("mentor-profile");
  const mentorSlug = mentor.slug;

  const { mentorLessons, mentorTopics, lessonCountByCategory, lessonCountByTopic } =
    useMemo(() => {
      const filteredLessons = sortLessonsByDisplayOrder(
        lessons.filter((lesson) => lesson.mentorSlug === mentorSlug),
      );
      const categoryCounts = new Map<EducationCategory, number>();
      const topicCounts = new Map<string, number>();

      for (const lesson of filteredLessons) {
        if (lesson.category) {
          categoryCounts.set(
            lesson.category,
            (categoryCounts.get(lesson.category) ?? 0) + 1,
          );
        }
        if (lesson.lessonTopicSlug) {
          topicCounts.set(
            lesson.lessonTopicSlug,
            (topicCounts.get(lesson.lessonTopicSlug) ?? 0) + 1,
          );
        }
      }

      return {
        mentorLessons: filteredLessons,
        mentorTopics: topics.filter((topic) => topic.mentorSlug === mentorSlug),
        lessonCountByCategory: categoryCounts,
        lessonCountByTopic: topicCounts,
      };
    }, [lessons, mentorSlug, topics]);

  return (
    <div className="space-y-6">
      <MentorDetailTabs
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {activeSection === "mentor-profile" ? (
        <section>
          <MentorForm mentor={mentor} />
        </section>
      ) : null}

      {activeSection === "mentor-categories" ? (
        <MentorCategoriesSection
          mentor={mentor}
          lessonCountByCategory={lessonCountByCategory}
        />
      ) : null}

      {activeSection === "mentor-lessons" ? (
        <MentorLessonsSection mentorSlug={mentor.slug} lessons={mentorLessons} />
      ) : null}

      {activeSection === "mentor-topics" ? (
        <MentorTopicsSection
          mentorSlug={mentor.slug}
          topics={mentorTopics}
          lessonCountByTopic={lessonCountByTopic}
        />
      ) : null}
    </div>
  );
}
